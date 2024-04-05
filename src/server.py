from fastapi import FastAPI, Body
import boto3
import uvicorn
import os

app = FastAPI()

# Replace with your AWS credentials and region
# aws_access_key_id = os.getenv("access_key_id")
# aws_secret_access_key = os.getenv("secret_access_key")
aws_access_key_id = "AKIARV6TXP4O7RJ5NX5Q"
aws_secret_access_key = "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"
region_names = ["us-east-2", "us-east-1"]  # Define region names in the order of preference

@app.get("/connected_region")
async def get_connected_region():
    return {"region": "us-east-1"}

def get_dynamodb_resource():
    dynamodb = None
    for region_name in region_names:
        try:
            dynamodb = boto3.resource(
                'dynamodb',
                aws_access_key_id=aws_access_key_id,
                aws_secret_access_key=aws_secret_access_key,
                region_name=region_name
            )
            # Try accessing the table to see if it exists
            dynamodb.Table('Songs').table_status
            break  # If table access is successful, break the loop
        except dynamodb.meta.client.exceptions.ResourceNotFoundException:
            print(f"Table not found in region {region_name}. Trying next region...")
        except Exception as e:
            print(f"Failed to connect to region {region_name}: {e}")
    if dynamodb is None:
        raise Exception("Failed to connect to any available region")
    return dynamodb


def get_song(song_name):
    dynamodb = get_dynamodb_resource()
    table = dynamodb.Table('Songs')
    response = table.get_item(Key={'songName': AttributeValue(s=song_name)})
    if 'Item' in response:
        return response['Item']
    else:
        return None


def add_song(song_name, artist_name, year_of_release):
    dynamodb = get_dynamodb_resource()
    table = dynamodb.Table('Songs')
    table.put_item(
        Item={
            'songName': AttributeValue(s=song_name),
            'artistName': AttributeValue(s=artist_name),
            'yearOfRelease': AttributeValue(n=str(year_of_release))
        }
    )


def update_song(song_name, artist_name):
    dynamodb = get_dynamodb_resource()
    table = dynamodb.Table('Songs')
    table.update_item(
        Key={'songName': AttributeValue(s=song_name)},
        UpdateExpression="SET artistName=:artist_name",
        ExpressionAttributeValues={':artist_name': AttributeValue(s=artist_name)}
    )


@app.get("/songs/{song_name}")
async def get_song_by_name(song_name: str):
    song = get_song(song_name)
    if song:
        return song
    else:
        return {"message": "Song not found"}


@app.post("/songs")
async def add_song_data(song_name: str = Body(...), artist_name: str = Body(...), year_of_release: int = Body(...)):
    add_song(song_name, artist_name, year_of_release)
    return {"message": "Song added successfully"}


@app.put("/songs/{song_name}")
async def update_song_artist(song_name: str, artist_name: str = Body(...)):
    update_song(song_name, artist_name)
    return {"message": "Song updated successfully"}


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
