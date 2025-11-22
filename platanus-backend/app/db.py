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
    first_name = fields.CharField(max_length=255)
    last_name = fields.CharField(max_length=255)
    relationship_type = fields.CharField(max_length=50)
    email = fields.CharField(max_length=255)
    phone = fields.CharField(max_length=50)
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


TORTOISE_ORM = {
    "connections": {"default": "sqlite://database.db"},
    "apps": {
        "models": {
            "models": ["app.db"],
            "default_connection": "default",
        },
    },
}
