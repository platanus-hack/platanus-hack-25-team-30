from tortoise import fields
from tortoise.models import Model


class User(Model):
    id = fields.IntField(primary_key=True)
    username = fields.CharField(max_length=255)
    password = fields.CharField(max_length=255)
    created_at = fields.DatetimeField(auto_now_add=True)
    persons: fields.ReverseRelation["Person"]

    class Meta:  # type: ignore[reportIncompatibleVariableOverride]
        table = "user"


class Person(Model):
    id = fields.IntField(primary_key=True)
    user: fields.ForeignKeyRelation[User] = fields.ForeignKeyField(
        "models.User", related_name="persons"
    )
    photo = fields.BinaryField(null=True)
    first_name = fields.CharField(max_length=255)
    last_name = fields.CharField(max_length=255)
    relationship_type = fields.CharField(max_length=50)
    birthday = fields.DateField()
    personality_tags = fields.JSONField()
    notes = fields.TextField()

    records: fields.ReverseRelation["Record"]

    class Meta:  # type: ignore[reportIncompatibleVariableOverride]
        table = "person"


class Record(Model):
    id = fields.IntField(primary_key=True)
    sent_from = fields.CharField(max_length=255)
    person: fields.ForeignKeyRelation[Person] = fields.ForeignKeyField(
        "models.Person", related_name="records"
    )
    source = fields.CharField(max_length=255)
    time = fields.DatetimeField()
    message_text = fields.TextField()
    created_at = fields.DatetimeField(auto_now_add=True)

    class Meta:  # type: ignore[reportIncompatibleVariableOverride]
        table = "record"


class ContactStatsCache(Model):
    id = fields.IntField(primary_key=True)
    person: fields.OneToOneRelation[Person] = fields.OneToOneField(
        "models.Person", related_name="stats_cache", on_delete=fields.CASCADE
    )
    health_score = fields.IntField()
    health_status = fields.CharField(max_length=50)
    last_conversation_topic = fields.CharField(max_length=255)
    total_interactions = fields.IntField()
    last_interaction_date = fields.DatetimeField(null=True)
    response_time_median_min = fields.FloatField(null=True)
    communication_balance = fields.FloatField(null=True)
    created_at = fields.DatetimeField(auto_now_add=True)

    class Meta:  # type: ignore[reportIncompatibleVariableOverride]
        table = "contact_stats_cache"


TORTOISE_ORM = {
    "connections": {"default": "sqlite://database.db"},
    "apps": {
        "models": {
            "models": ["app.db"],
            "default_connection": "default",
        },
    },
}
