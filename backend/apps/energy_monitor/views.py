import json
from django.http import JsonResponse, HttpResponseBadRequest
from django.views.decorators.csrf import csrf_exempt
from .models import EnergyData , TariffRate
from datetime import datetime, timezone , timedelta
from mongoengine.queryset.visitor import Q
from collections import defaultdict

def update_tariff_rates(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            entry = TariffRate.objects.first()
            if entry:
                for key, value in data.items():
                    setattr(entry, key, value)
            else:
                # create new if not exists
                entry = TariffRate(**data)

            entry.save()
            return JsonResponse({'status': 'success'})
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=400)


def get_tariff_rates(request):
    try:
        rates = TariffRate.objects().first()
        if not rates:
            return JsonResponse({'error': 'No tariff rates found'}, status=404)
        return JsonResponse({
            'grid_rate': rates.grid_rate,
            'solar_rate': rates.solar_rate,
        })
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=400)

def submit_energy_data(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            
            # Parse timestamp string to datetime object
            if 'timestamp' in data:
                data['timestamp'] = datetime.fromisoformat(data['timestamp'].replace('Z', '+00:00'))
            
            entry = EnergyData(**data)
            entry.save()
            return JsonResponse({'status': 'success'})
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=400)
    else:
        return HttpResponseBadRequest('Only POST allowed')


def graph_analytics(request):
    user_id = request.GET.get("user_id")
    mode = request.GET.get("mode")
    date_range = request.GET.get("range", "today")
    start_date = request.GET.get("start_date")
    end_date = request.GET.get("end_date")

    if not user_id or not mode:
        return JsonResponse({"error": "user_id and mode are required"}, status=400)

    now = datetime.now(timezone.utc)

    # --- Date filtering ---
    if date_range == "today":
        start = datetime(now.year, now.month, now.day, tzinfo=timezone.utc)
        end = datetime(now.year, now.month, now.day, 23, 59, 59, tzinfo=timezone.utc)

    elif date_range == "month":
        start = datetime(now.year, now.month, 1, tzinfo=timezone.utc)
        if now.month == 12:
            end = datetime(now.year + 1, 1, 1, tzinfo=timezone.utc)
        else:
            end = datetime(now.year, now.month + 1, 1, tzinfo=timezone.utc)

    elif date_range == "year":
        start = None
        end = None

    elif date_range == "custom" and start_date and end_date:
        start = datetime.fromisoformat(start_date).replace(tzinfo=timezone.utc)
        end = datetime.fromisoformat(end_date).replace(tzinfo=timezone.utc) + timedelta(days=1)

    else:
        return JsonResponse({"error": "Invalid range or missing dates"}, status=400)

    # --- Fetch records ---
    if start and end:
        records = EnergyData.objects(
            user_id=user_id,
            timestamp__gte=start,
            timestamp__lt=end
        ).order_by("timestamp")
    else:
        # If start/end are not set, fetch all records for this user
        records = EnergyData.objects(
            user_id=user_id,
        ).order_by("timestamp")


    if not records:
        return JsonResponse({"error": "No records found"}, status=404)

    # Extract data
    timestamps_dt = [r.timestamp for r in records]
    power_data_raw = [r.power_usage or 0 for r in records]
    solar_data_raw = [r.solar_generation or 0 for r in records]

    # --- Helper to aggregate based on range ---
    def format_x_axis_and_data(timestamps, data, range_type):
        grouped = defaultdict(float)
        for ts, val in zip(timestamps, data):
            if range_type == "today":
                key = ts.strftime("%H")  # hour 00-23
            elif range_type == "month":
                key = ts.strftime("%d")  # day of month
            elif range_type == "year":
                key = ts.strftime("%Y")  # Groups by year, e.g. "2024", "2025"
            elif range_type == "custom":
                key = ts.strftime("%Y-%m-%d")  # full date
            else:
                key = ts.isoformat()

            grouped[key] += val

        # Sort axis properly
        if range_type == "today":
            x_axis = sorted(grouped.keys(), key=lambda k: int(k))
        elif range_type == "month":
            x_axis = sorted(grouped.keys(), key=lambda k: int(k))
        elif range_type == "year":
            x_axis = sorted(grouped.keys(), key=lambda k: int(k))  # sort as year
        else:
            x_axis = sorted(grouped.keys())

        values = [grouped[k] for k in x_axis]
        return x_axis, values, grouped

    # --- Mode specific ---
    if mode == "grid":
        x_axis, power_data, grouped = format_x_axis_and_data(timestamps_dt, power_data_raw, date_range)

        response = {
            "user_id": user_id,
            "mode": "grid",
            "x_axis": x_axis,
            "power_usage": power_data,
        }

    elif mode == "solar":
        x_axis, solar_data, grouped = format_x_axis_and_data(timestamps_dt, solar_data_raw, date_range)

        response = {
            "user_id": user_id,
            "mode": "solar",
            "x_axis": x_axis,
            "solar_generation": solar_data,
        }

    elif mode == "hybrid":
        x_axis, power_data, grouped_power = format_x_axis_and_data(timestamps_dt, power_data_raw, date_range)
        _, solar_data, grouped_solar = format_x_axis_and_data(timestamps_dt, solar_data_raw, date_range)

        response = {
            "user_id": user_id,
            "mode": "hybrid",
            "x_axis": x_axis,
            "power_usage": power_data,
            "solar_generation": solar_data,
        }
    else:
        return JsonResponse({"error": "Invalid mode"}, status=400)

    # Aggregate values
    total_consumption = sum(r.power_usage or 0 for r in records)
    total_solar = sum(r.solar_generation or 0 for r in records)

    # Tariff rates
    rates = TariffRate.objects.first()
    grid_rate = rates.grid_rate if rates else 7.0
    solar_rate = rates.solar_rate if rates else 3.0

    result = {
        "user_id": user_id,
        "mode": mode,
    }

    # --- Mode-specific logic ---
    if mode == "grid":
        result["consumption"] = round(total_consumption, 2)
        result["cost"] = round(-total_consumption * grid_rate, 2)

    elif mode == "solar":
        net_energy = total_solar - total_consumption
        result["consumption"] = round(total_consumption, 2)
        result["solar"] = round(total_solar, 2)
        result["cost"] = round(net_energy * solar_rate, 2)

    elif mode == "hybrid":
        net_export = total_solar - total_consumption
        if net_export < 0:
            cost = -abs(net_export) * grid_rate
        else:
            cost = net_export * solar_rate 
        result["consumption"] = round(total_consumption, 2)
        result["solar"] = round(total_solar, 2)
        result["cost"] = round(cost, 2)


    response = {**response, **result}
    return JsonResponse(response, safe=False)
