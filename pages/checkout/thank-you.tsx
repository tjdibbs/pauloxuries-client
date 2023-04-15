import React from "react";
import { Box, Button, Divider } from "@mui/material";
import BreadcrumbComp from "@comp/BreadcrumbComp";
import { NextPage } from "next";
import { OrderType } from "@lib/types";
import Address from "@comp/checkout/Address";
import BasicInfo from "@comp/checkout/BasicInfo";
import OrderProduct from "@comp/checkout/OrderProduct";
import NoOrder from "@comp/checkout/NoOrder";
import { useRouter } from "next/router";
import axios from "axios";
import dynamic from "next/dynamic";
import useMessage from "@hook/useMessage";
import { useAppSelector } from "@lib/redux/store";

const ThankYou: NextPage<{
  order: OrderType | null;
  token?: string;
  message?: string;
  error?: boolean;
}> = (props) => {
  const user = useAppSelector((state) => state.shop.user);
  const [fetching, setFetching] = React.useState<boolean>(true);
  const [order, setOrder] = React.useState<OrderType>();
  const router = useRouter();

  const { alertMessage } = useMessage();

  const { orderId, token } = router.query;

  const getOrder = React.useCallback(async () => {
    try {
      const reqOrder = await axios.get("/api/order/" + orderId);

      const {
        success,
        orders: [order],
      } = await reqOrder.data;

      if (!order) throw new Error("Order not found");

      setOrder({ ...order, cart: JSON.parse(order.cart) }), setFetching(false);
    } catch (error) {
      setFetching(false);
    }
  }, [orderId]);

  const setDelivered = async () => {
    try {
      const req = await axios.put("/api/order/" + orderId);
      const res = await req.status;

      console.log({ res });
      if (res === 200)
        // @ts-ignore
        setOrder((order) => ({ ...order, status: "delivered" }));
    } catch (error) {
      console.error(error);
      alertMessage("We are having issue communicating to server", "error");
    }
  };

  const cancelOrder = () => {
    try {
    } catch (error) {}
  };

  React.useEffect(() => {
    getOrder();
  }, [getOrder]);

  if (fetching) return <Loading />;
  if (!order) return <NoOrder message={"Unable to get order"} />;

  return (
    <div className="component-wrap">
      <Box className={"breadcrumbs-wrapper"} my={3}>
        <BreadcrumbComp links={links} />
      </Box>
      <div className="page-title font-bold text-xl mb-10">
        {" "}
        ✅ Order Complete
      </div>

      <section className="appreciate">
        <div className="order-id font-medium text-sm text-gray-600">
          Order #{order.order_number}
        </div>
        <div className="text-2xl font-semibold">
          Thank you {order.name.split(" ")[0]} 🥰
        </div>
        <p className="text-sm">for choosing from pauloxuries store.</p>
      </section>

      <div className="flex flex-wrap gap-10 my-6">
        <section className="order-information-container flex-1">
          <div className="customer-information border border-gray-700 p-4  shadow-lg mb-10">
            <div className="title text-xl font-bold mb-4">
              Customer Information
            </div>
            <ul className="infos flex flex-wrap gap-6 sm:px-4 my-10">
              <BasicInfo title="Email" value={order.email} />
              <BasicInfo title="Phone" value={order.phone} />
              <Address
                title="Billing Address"
                address={order.address}
                state={order.state}
                country={order.country}
              />
              <Address
                title="Delivery Address"
                address={order.address}
                state={order.state}
                country={order.country}
              />
            </ul>
          </div>

          <div className="order-details border border-gray-700 p-4 shadow-lg">
            <div className="title text-xl font-bold mb-4">Order Details</div>
            <ul className="products flex flex-col gap-y-4">
              {order.cart.map((cartProduct) => {
                return (
                  <OrderProduct
                    setOrder={setOrder}
                    cartProduct={cartProduct}
                    key={cartProduct.id}
                  />
                );
              })}
            </ul>

            <div className="totals my-5">
              <div className="subtotal flex justify-between items-between p-2">
                <div className="label">Subtotal:</div>
                <div className="amount font-bold">
                  {"₦" + order.subtotal.toLocaleString()}
                </div>
              </div>
              <div className="discount flex justify-between items-between p-2">
                <div className="label">Discount:</div>
                <div className="amount font-bold">
                  {"₦" + order.discount.toLocaleString()}
                </div>
              </div>
              <div className="shipping flex justify-between items-between p-2">
                <div className="label">Shipping:</div>
                <div className="amount font-bold">
                  {"₦" + (3_500).toLocaleString()} via GIG park
                </div>
              </div>

              <Divider />

              <div className="total flex justify-between items-between p-2 mt-5">
                <div className="label font-extrabold">Total:</div>
                <div className="flex items-center flex-wrap-reverse gap-3">
                  <div className="payment-method">
                    <div className="chip naira border border-blue-500 text-blue-500 px-3 py-1 font-bold text-[10px] rounded-full w-max">
                      Pay with Transfer
                    </div>
                  </div>
                  <div className="amount font-black text-xl">
                    {"₦" + order.total.toLocaleString()}
                  </div>
                </div>
              </div>
            </div>

            {user && (
              <div className="actions">
                <Button
                  size="small"
                  variant="outlined"
                  className="capitalize text-sm"
                  onClick={cancelOrder}
                >
                  Cancel All
                </Button>
                {user.admin && token && (
                  <Button
                    size="small"
                    variant="outlined"
                    className="capitalize text-sm"
                    onClick={setDelivered}
                  >
                    Delivered
                  </Button>
                )}
              </div>
            )}
          </div>
        </section>

        <aside className="right sm:w-full md:max-w-[350px]">
          <div className="bank-details pb-[3.5em] border border-gray-700 p-4 shadow-lg">
            <div className="button-group flex gap-x-4">
              <Button
                variant="contained"
                className="bg-primary-low text-white capitalize text-sm rounded-sm shadow-lg"
              >
                Review your orders
              </Button>
              <Button className="bg-primary-low/10 capitalize text-sm rounded-sm shadow-lg">
                Continue Shopping
              </Button>
            </div>
            <div className="bank-details mt-5">
              <Divider>
                <div className="title text-xl text-center font-extrabold">
                  Our Bank Account
                </div>
              </Divider>
              <div className="naira-account my-5 max-w-[400px]">
                <div className="chip naira border border-primary-low text-primary-low px-3 py-1 font-bold text-[10px] rounded-full w-max">
                  Naira Account
                </div>
                <div className="account-name font-bold my-3">
                  Pauloxuries Online
                </div>
                <div className="flex justify-between gap-3">
                  <div className="bank">
                    <div className="caption text-[10px] uppercase">Bank</div>
                    <div className="name font-black text-lg">GTBank</div>
                  </div>
                  <div className="account-number">
                    <div className="caption text-[10px] uppercase">
                      Account Number
                    </div>
                    <div className="number font-black text-lg">0595054179</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="delivery border border-gray-700 p-4 shadow-lg mt-10">
            <div className="title font-bold text-xl mb-5">Delivery</div>
            <div className="text">
              <span>Your order will be delivered within:</span>

              <ul className="list-disc pl-5 my-4">
                <li>Lagos: 1-3 working days</li>
                <li>Outside Lagos: 3-7 working days</li>
              </ul>

              <p className="font-bold text-primary-low">
                Please allow extra day(s) for custom order or bulk order.
              </p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

const links = [
  {
    label: "home",
    path: "/",
  },
  {
    label: "checkout",
    path: "#",
    disabled: true,
  },
  {
    label: "complete",
  },
];

const Loading = () => (
  <div className="fetching-wrapper p-4">
    <div className="loading animate-pulse h-6 bg-primary-low/20 rounded-lg mb-4" />
    <div className="loading animate-pulse h-10 bg-primary-low/30 rounded-lg" />

    <div className="flex flex-wrap gap-10 mt-10">
      <div className="min-w-[280px] shadow-lg flex-grow h-80 bg-primary-low/10 animate-pulse" />
      <div className="min-w-[280px] shadow-lg flex-grow h-80 bg-primary-low/10 animate-pulse" />
    </div>
  </div>
);

export default dynamic(async () => ThankYou, {
  ssr: false,
  loading: () => <Loading />,
});
