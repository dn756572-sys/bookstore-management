import React from 'react'
import Layout from '../../components/common/Layout'
import Cart from '../../components/cart/Cart'

const CartPage = () => {
  return (
    <Layout>
      <div className="cart-page">
        <div className="container">
          <Cart />
        </div>
      </div>
    </Layout>
  )
}

export default CartPage