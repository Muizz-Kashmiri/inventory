from fastapi import FastAPI, Body
from fastapi.middleware.cors import CORSMiddleware
import boto3
from boto3.dynamodb.conditions import Key
from botocore.exceptions import ClientError
import os

app = FastAPI()

# Define the name of the DynamoDB table
table_name = 'Songs'

# Add CORS middleware
origins = [
    "*"
    # "http://0.0.0.0:8080", # React app served from this origin
    # Add any other origins you want to allow here
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)



def get_dynamodb_client():
    try:
        # First, try connecting to us-east-2
        dynamodb = boto3.client(
            'dynamodb',
            region_name='us-east-2',
            aws_access_key_id=os.getenv("access_key_id"),
            aws_secret_access_key=os.getenv("secret_access_key")
        )

        # Check if the table exists in us-east-2
        dynamodb.describe_table(TableName=table_name)
        print("Connected to us-east-2")
        return dynamodb
    except ClientError:
        # If us-east-2 is not available or table doesn't exist, fallback to us-east-1
        dynamodb = boto3.client(
            'dynamodb',
            region_name='us-east-1',
            aws_access_key_id=os.getenv("access_key_id"),
            aws_secret_access_key=os.getenv("secret_access_key")
        )
        print("Connected to us-east-1")
        return dynamodb



dynamodb = get_dynamodb_client()


def get_song(song_name):
    try:
        # Retrieve item from DynamoDB
        response = dynamodb.get_item(
            TableName=table_name,
            Key={'Name': {'S': song_name}}
        )
        # Check if item exists in the response
        item = response.get('Item')
        return item
    except ClientError as e:
        print(f"Error getting song: {e}")
        return None


def add_song(Name, Artist, ReleaseYear):
    try:
        dynamodb.put_item(
            TableName=table_name,
            Item={
                'Name': {'S': Name},
                'Artist': {'S': Artist},
                'ReleaseYear': {'N': str(ReleaseYear)}
            }
        )
        return True
    except ClientError as e:
        print(f"Error adding song: {e}")
        return False


def get_all_songs():
    try:
        response = dynamodb.scan(TableName=table_name)
        songs = response.get('Items', [])
        return songs
    except ClientError as e:
        print(f"Error getting all songs: {e}")
        return []


@app.get("/songs/{Name}")
async def get_song_by_name(Name: str):
    song = get_song(Name)
    if song:
        return song
    else:
        return {"message": "Song not found"}


@app.get("/songs")
async def get_all_songs_handler():
    songs = get_all_songs()
    return songs


@app.post("/songs")
async def add_song_data(Name: str = Body(...), Artist: str = Body(...), ReleaseYear: int = Body(...)):
    if add_song(Name, Artist, ReleaseYear):
        return {"message": "Song added successfully"}
    else:
        return {"message": "Failed to add song"}


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)
