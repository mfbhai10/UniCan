import React, { useEffect } from "react";
import { serverUrl } from "../App";
import { useDispatch, useSelector } from "react-redux";
import { setItemsInMyCity, setUserData } from "../redux/userSlice";
import axios from "axios";
import { setMyShopData } from "../redux/ownerSlice";

function useGetItemsByCity() {
  const dispatch = useDispatch();
  const { currentCity } = useSelector((state) => state.user);
  useEffect(() => {
    if (!currentCity) return; // Don't fetch if city is not set

    const fetchItems = async () => {
      try {
        const result = await axios.get(
          `${serverUrl}/api/item/get-by-city/${currentCity}`,
          { withCredentials: true },
        );
        dispatch(setItemsInMyCity(result.data));
        console.log("Items fetched:", result.data);
      } catch (error) {
        console.log("Error fetching items:", error);
      }
    };
    fetchItems();
  }, [currentCity]);
}

export default useGetItemsByCity;
