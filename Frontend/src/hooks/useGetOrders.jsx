import { useEffect } from "react";
import { serverUrl } from "../App";
import { useDispatch, useSelector } from "react-redux";
import {
  setUserOrders,
  setOwnerOrders,
  setOrderLoading,
} from "../redux/orderSlice";

const useGetOrders = () => {
  const dispatch = useDispatch();
  const { userData } = useSelector((state) => state.user);

  useEffect(() => {
    const fetchOrders = async () => {
      if (!userData) return;

      dispatch(setOrderLoading(true));
      try {
        // Fetch user orders
        const userOrdersRes = await fetch(
          `${serverUrl}/api/order/user-orders`,
          {
            method: "GET",
            credentials: "include",
          }
        );
        if (userOrdersRes.ok) {
          const userOrdersData = await userOrdersRes.json();
          dispatch(setUserOrders(userOrdersData));
        }

        // Fetch owner orders (if user is an owner)
        const ownerOrdersRes = await fetch(
          `${serverUrl}/api/order/owner-orders`,
          {
            method: "GET",
            credentials: "include",
          }
        );
        if (ownerOrdersRes.ok) {
          const ownerOrdersData = await ownerOrdersRes.json();
          dispatch(setOwnerOrders(ownerOrdersData));
        }
      } catch (error) {
        console.error("Error fetching orders:", error);
      } finally {
        dispatch(setOrderLoading(false));
      }
    };

    fetchOrders();
  }, [userData, dispatch]);
};

export default useGetOrders;
