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
  const { userData } = useSelector((state) => state.user);
  const apikey = import.meta.env.VITE_GEOAPIKEY;
  useEffect(() => {
    navigator.geolocation.getCurrentPosition(async (position) => {
      const latitude = position.coords.latitude;
      const longitude = position.coords.longitude;
      const result = await axios.get(
        `https://api.geoapify.com/v1/geocode/reverse?lat=${latitude}&lon=${longitude}&format=json&apiKey=${apikey}`
      );
      console.log(result.data.results[0].city);
      dispatch(setCurrentCity(result?.data?.results[0].city));
      dispatch(setCurrentState(result?.data?.results[0].state));
      dispatch(setCurrentAddress(result?.data?.results[0].address_line2
 || result?.data?.results[0].address_line1));
      console.log(result.data);
      
    });
  }, [userData]);
}

export default useGetCity;
