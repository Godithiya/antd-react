import { Route, Routes } from "react-router-dom";
import DashboardPage from "./screen/dashboard/DashboardPage";
import LayoutPage from "./screen/LayoutPage";
import { useEffect, useState } from "react";
import LoginPage from "./screen/login/LoginPage";
import PageNotFound from "./screen/PageNotFound";
import supabase from "./supabase";
import Register from "./screen/login/Register";
import Attendances from "./screen/attendances/Attendances";
import Messages from "./screen/messages/Messages";


const App = () => {

  const [ session, setSession ] = useState( true )

  useEffect(()=>{

    supabase.auth.getSession()
    .then(({data : { session }})=>{
      setSession(session)
    })

    const {
      data : { subscription }
    } = supabase.auth.onAuthStateChange((_event, session)=>{
      setSession(session)
    })

    return ()=> subscription.unsubscribe()

  }, [])

  if( session ){
    return (
      <Routes>
        <Route path="/" element={<LayoutPage/>}>
          <Route index element={<DashboardPage />} />
          <Route path="attendances" element={<Attendances />} />
          <Route path="setting" element={<h1>setting</h1>} />
          <Route path="messages" element={<Messages/>} />
          <Route path="*" element={<h1>page not found !</h1>} />
        </Route>
      </Routes>
    );
  }

  return(
    <Routes>
      <Route path="/" element={<LoginPage/>} />
      <Route path="register" element={<Register/>} />
      <Route path="*" element={<PageNotFound/>} />
    </Routes>
  )


};

export default App;
