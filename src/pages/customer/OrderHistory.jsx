import React from 'react'
import Layout from '../../components/common/Layout'
import OrderList from '../../components/orders/OrderList'

const OrderHistory = () => {
  return (
    <Layout>
      <div className="order-history-page">
        <div className="container">
          <h1>Lịch sử đơn hàng</h1>
          <OrderList />
        </div>
      </div>
    </Layout>
  )
}

export default OrderHistory