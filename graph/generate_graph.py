import matplotlib.pyplot as plt
import numpy as np
import mysql.connector
import os
from decimal import Decimal

# ✅ Database connection
db = mysql.connector.connect(
    host="localhost",
    user="root",
    password="9926703993",
    database="multi_transfer"
)

cursor = db.cursor()

# ✅ Fetch necessary columns including transactionHash
cursor.execute("""
    SELECT recipientCount, totalAmount, transactionSpeed, blockPropagationTime, gasUsed, transactionHash 
    FROM Transactions
""")
data = cursor.fetchall()
cursor.close()
db.close()

# ✅ Extract values & Convert Decimal to float
recipient_counts = [int(d[0]) for d in data]  
total_amounts = [float(d[1]) if isinstance(d[1], Decimal) else d[1] for d in data]
transaction_speeds = [float(d[2]) if isinstance(d[2], Decimal) else d[2] for d in data]
block_times = [float(d[3]) if isinstance(d[3], Decimal) else d[3] for d in data]
gas_used = [float(d[4]) if isinstance(d[4], Decimal) else d[4] for d in data]
transaction_hashes = [str(d[5]) for d in data]  # Get transaction hashes

# ✅ Create figure and axis
fig, ax1 = plt.subplots(figsize=(12, 6))

# ✅ Define bar width and positions
bar_width = 0.2
x_indexes = np.arange(len(recipient_counts))

# ✅ Plot Gas Used on primary Y-axis
ax1.bar(x_indexes - 1.5 * bar_width, gas_used, width=bar_width, color="red", label="Gas Used")

# ✅ Secondary Y-axis for Block Time, Amount & Transaction Speed
ax2 = ax1.twinx()
ax2.bar(x_indexes - 0.5 * bar_width, block_times, width=bar_width, color="blue", label="Block Time (s)")
ax2.bar(x_indexes + 0.5 * bar_width, total_amounts, width=bar_width, color="green", label="Amount (ETH)")
ax2.bar(x_indexes + 1.5 * bar_width, transaction_speeds, width=bar_width, color="purple", label="Transaction Speed (TPS)")

# ✅ Add transaction hash at the end of every node
for i, (x, tx_hash) in enumerate(zip(x_indexes, transaction_hashes)):
    ax1.text(x, max(gas_used) + 2000, tx_hash[:10] + "...", ha="center", fontsize=8, rotation=45, color="black")

# ✅ Labels and Legends
ax1.set_xlabel("Number of Recipients")
ax1.set_ylabel("Gas Used", color="red")
ax2.set_ylabel("Block Time, Amount, Transaction Speed", color="blue")

ax1.set_xticks(x_indexes)
ax1.set_xticklabels(recipient_counts)

# ✅ Legends for both axes
ax1.legend(loc="upper left")
ax2.legend(loc="upper right")

# ✅ Grid and Title
ax1.grid(True, linestyle="--", alpha=0.6)
plt.title("Blockchain Metrics per Node")

# ✅ Save graph image
graph_dir = os.path.dirname(os.path.abspath(__file__))
image_path = os.path.join(graph_dir, "graph.png")
plt.savefig(image_path)
plt.close()

# ✅ Print the image path for backend
print(image_path)
