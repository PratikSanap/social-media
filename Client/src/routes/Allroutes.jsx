import { Route, createBrowserRouter, createRoutesFromElements } from 'react-router-dom';
import SignUp from '../pages/SignUp';
import Login from '../pages/Login';
import Home from '../pages/Home';
import Profile from '../pages/Profile';
import Getprofile from '../pages/getprofile';


import NotificationsPage from '../pages/NotificationsPage';
import { UserProvider } from '../api/UserContext';
import FriendsList from '../pages/FriendsList';
import ChatPage from '../pages/ChatPage';
export const router = createBrowserRouter(
  createRoutesFromElements(
      <>
      <Route path="/" element={<SignUp />}></Route>
      <Route path="/login" element={<Login />} />
      <Route path="/home" element={<Home/>}></Route>
      <Route path="/profile" element={<Profile/>}></Route>
      <Route path="/profile/:userId" element={<Getprofile/>}></Route>
      <Route path="/notifications" element={<NotificationsPage/>}></Route>
      <Route path="/chat" element={<FriendsList/>}></Route>
      <Route path='/chat/:friendId' element={<ChatPage/>}></Route>
      {/*search patient by army no*/}
      
      </>
  )
);
