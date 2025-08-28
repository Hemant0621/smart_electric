from mongoengine import Document, fields

class EnergyData(Document):
    user_id = fields.StringField(required=True)
    timestamp = fields.DateTimeField(required=True)
    power_usage = fields.FloatField()
    solar_generation = fields.FloatField()

class TariffRate(Document):
    grid_rate = fields.FloatField(required=True)
    solar_rate = fields.FloatField(required=True) 
