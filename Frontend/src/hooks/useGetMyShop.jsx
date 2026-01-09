import React, { useEffect } from 'react';
import { serverUrl } from '../App';
import { useDispatch } from 'react-redux';
import { setUserData } from '../redux/userSlice';
import axios from 'axios';
import { setMyShopData } from '../redux/ownerSlice';

function useGetMyShop() {
    const dispatch = useDispatch();
    useEffect(() => {
        const fetchShop = async () => {
            try {
                const result = await axios.get(
                    `${serverUrl}/api/shop/my-shop`,
                    { withCredentials: true }
                  );
                  dispatch(setMyShopData(result.data));
            } catch (error) {
                    console.log(error);
                
            }
        }
        fetchShop();

    }, []);
};

export default useGetMyShop;