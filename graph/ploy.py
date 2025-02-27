import matplotlib.pyplot as plt
import mysql.connector

db = mysql.connector.connect(host="localhost", user="root", password="password", database="multi_transfer")
cursor = db.cursor()
cursor.execute("SELECT totalAmount, gasUsed FROM transactions")
data = cursor.fetchall()

amounts = [x[0] for x in data]
gasUsed = [x[1] for x in data]

plt.figure(figsize=(8,5))
plt.plot(amounts, gasUsed, marker="o", linestyle="--", color="b", label="Gas Used")
plt.xlabel("Total Amount Transferred")
plt.ylabel("Gas Used")
plt.title("Gas Usage vs. Transfer Amount")
plt.legend()
plt.grid(True)
plt.show()
