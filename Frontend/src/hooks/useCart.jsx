import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { serverUrl } from "../App";
import { setCartItems, setTotalAmount } from "../redux/userSlice";

function useCart() {
  const dispatch = useDispatch();
  const { userData } = useSelector((state) => state.user);

  useEffect(() => {
    if (!userData) return;

    const fetchCart = async () => {
      try {
        const response = await fetch(`${serverUrl}/api/cart`, {
          method: "GET",
          credentials: "include",
        });

        if (response.ok) {
          const data = await response.json();
          if (data.success && data.cart) {
            // Transform backend cart to frontend format
            const cartItems = data.cart.items.map((item) => ({
              id: item.item._id,
              name: item.item.name,
              image: item.item.image,
              price: item.priceAtAddition,
              quantity: item.quantity,
              shop: item.shop,
              shopId: item.shop?._id,
              ownerId: item.shop?.owner,
              category: item.item.category,
              foodType: item.item.foodType,
            }));

            dispatch(setCartItems(cartItems));
            dispatch(setTotalAmount(data.cart.totalAmount));
          }
        }
      } catch (error) {
        console.error("Error fetching cart:", error);
      }
    };

    fetchCart();
  }, [userData, dispatch]);
}

export default useCart;
