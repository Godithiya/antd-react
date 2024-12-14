import { Button, Form, Input } from "antd";
import { NavLink } from "react-router-dom";
import supabase from "../../supabase";

const Register = () => {

  function handleSubmit(e){

    let { email, password, repassword } = e

    // jika password dan repassword tidak sama
    if(password !== repassword)
      return alert("password must same!")
    supabase.auth.signUp({
      email : email,
      password : password
    })
    .then(res => {
      console.info(res)
    })

    
  }




  return (
    <main
      className={`w-[100dvw] h-[100dvh] flex flex-col justify-center items-center bg-gradient-to-tr from-sky-800 to-sky-400`}
    >
      <div
        className={`w-[700px] min-h-[300px] bg-white shadow-md rounded-xl flex`}
      >
        <div className="flex-1">
          <img
            src="https://images.pexels.com/photos/691901/pexels-photo-691901.jpeg?auto=compress&cs=tinysrgb&w=600"
            alt=""
            className={`h-full object-cover rounded-l-xl`}
          />
        </div>
        <div className={`flex-1 p-6 select-none`}>
          <h1 className="text-center text-2xl font-bold text-sky-600">
            Register Page
          </h1>
          <Form
            name="register-form"
            labelCol={{ span: 12 }}
            wrapperCol={{ span: 24 }}
            layout="vertical"
            onFinish={ handleSubmit }
            className={`flex flex-col gap-2`}
          >
            <Form.Item
              label="email"
              id="email"
              name="email"
              rules={[
                {
                  required: true,
                  message: "email harus di isi",
                },
                {
                  type: "email",
                  message: "email tidak valid",
                },
              ]}
            >
              <Input size={`large`} />
            </Form.Item>

            <Form.Item
              label="password"
              id="password"
              name="password"
              rules={[
                {
                  required: true,
                  message: "password harus di isi",
                },
              ]}
            >
              <Input.Password size={`large`} />
            </Form.Item>

            <Form.Item
              label="repassword"
              id="repassword"
              name="repassword"
              rules={[
                {
                  required: true,
                  message: "repassword harus di isi",
                },
              ]}
            >
              <Input.Password size={`large`} />
            </Form.Item>

            <Button
              type="primary"
              htmlType="submit"
              className={`ml-auto font-semibold shadow-md`}
              size={`large`}
            >
              Register
            </Button>

            <NavLink to={'/'} className={`text-center`}>
              Have account ? Login Here
            </NavLink>

          </Form>
        </div>
      </div>
    </main>
  );
};

export default Register;
