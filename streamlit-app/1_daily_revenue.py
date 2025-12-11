import streamlit as st
import pandas as pd
from pipeline.db.connection import get_connection

st.title("Daily Revenue Analytics")

conn = get_connection()
df = pd.read_sql("SELECT * FROM gold.vw_DailyRevenue", conn)
conn.close()

st.line_chart(df, x="revenueDate", y="totalRevenue")
st.bar_chart(df, x="revenueDate", y="avgBillAmount")
