import React, { useEffect } from "react";
import { serverUrl } from "../App";
import { useDispatch, useSelector } from "react-redux";
import {
  setCurrentAddress,
  setCurrentCity,
  setCurrentState,
  setUserData,
} from "../redux/userSlice";
import axios from "axios";

function useGetCity() {
  const dispatch = useDispatch();
  const { userData, currentCity } = useSelector((state) => state.user);
  const apikey = import.meta.env.VITE_GEOAPIKEY;

  useEffect(() => {
    // Only fetch location if user is logged in and city is not already set
    if (!userData || currentCity) {
      return;
    }

    console.log("Fetching user location...");

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const latitude = position.coords.latitude;
          const longitude = position.coords.longitude;
          const result = await axios.get(
            `https://api.geoapify.com/v1/geocode/reverse?lat=${latitude}&lon=${longitude}&format=json&apiKey=${apikey}`,
          );
          console.log("Location fetched:", result.data.results[0].city);
          dispatch(setCurrentCity(result?.data?.results[0].city));
          dispatch(setCurrentState(result?.data?.results[0].state));
          dispatch(
            setCurrentAddress(
              result?.data?.results[0].address_line2 ||
                result?.data?.results[0].address_line1,
            ),
          );
        } catch (error) {
          console.error("Error fetching location from API:", error);
        }
      },
      (error) => {
        console.error("Geolocation error:", error);
      },
    );
  }, [userData, currentCity, apikey, dispatch]);
}

export default useGetCity;
