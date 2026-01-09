import React, { useEffect } from 'react';
import { serverUrl } from '../App';
import { useDispatch } from 'react-redux';
import { setUserData } from '../redux/userSlice';
import axios from 'axios';

function useGetCurrentUser() {
    const dispatch = useDispatch();
    useEffect(() => {
        const fetchUser = async () => {
            try {
                const result = await axios.get(
                    `${serverUrl}/api/user/current`,
                    { withCredentials: true }
                  );
                  dispatch(setUserData(result.data));
            } catch (error) {
                // 401 is expected when user is not logged in - silently ignore
                if (error.response?.status !== 401) {
                    console.log(error);
                }
            }
        }
        fetchUser();

    }, []);
};

export default useGetCurrentUser;