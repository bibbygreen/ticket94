import json
import mysql.connector.pooling

con = {
    "user": "root",
    "password": "root",
    "host": "localhost",
    "database": "ticket94"
}

connection_pool = mysql.connector.pooling.MySQLConnectionPool(
    pool_name="my_pool",
    pool_size=5,
    **con
)

def execute_query(sql, values=None):
    connection = None
    try:
        # Acquire a connection from the pool
        connection = connection_pool.get_connection()

        if connection.is_connected():
            cursor = connection.cursor()
            if values:
                cursor.execute(sql, values)
                connection.commit()
            else:
                cursor.execute(sql)
            result = cursor.fetchall()
            return result
    except mysql.connector.Error as e:
        print(f"Error: {e.msg}")
    finally:
        if connection:
            cursor.close()
            connection.close()

url = "static/data/event-list.json"
with open(url, 'r', encoding='utf-8') as file:
    data = json.load(file)

for item in data['results']:
    description = item["description"]
    eventName = item["eventName"]
    date = item["date"]
    time = item["Time"]
    location = item["location"]
    address = item["address"]
    organizer = item["organizer"]
    saleTime = item["saleTime"]
    onSale = item["onSale"] == "True"  # Convert string to boolean: "True" -> True, others -> False
    price = item["price"]
    pic = item["pic"]
    category = item["category"]

# for i in range(len(data['results'])):
#     description=data['results'][i]["description"]
#     eventName=data['results'][i]["eventName"]
#     date=data['results'][i]["date"]
#     time=data['results'][i]["Time"]
#     location=data['results'][i]["location"]
#     address=data['results'][i]["address"]
#     organizer=data['results'][i]["organizer"]
#     saleTime=data['results'][i]["saleTime"]
#     onSale=data['results'][i]["onSale"]
#     price=data['results'][i]["price"]
#     pic=data['results'][i]["pic"]
#     category=data['results'][i]["category"]
  
    execute_query("INSERT INTO event_lists (description, eventName, date, time, location, address, organizer, saleTime, onSale, price, pic, category) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)",(description, eventName, date, time, location, address, organizer, saleTime, onSale, price, pic, category))
