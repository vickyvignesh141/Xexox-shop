import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import styles from "./CustomerRegister.module.css";

function CustomerRegister() {
  const [existingCustomer, setExistingCustomer] = useState(false);
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    mobile: "",
    department: "",
    year: "",
    section: "",
    email: "",
  });

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };
  const handleVerify = async () => {
    if (!form.mobile || form.mobile.length !== 10) {
      alert("Enter a valid 10 digit mobile number");
      return;
    }

    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/customers/${form.mobile}`
      );

      const customer = response.data.customer;

      setForm({
        name: customer.name,
        mobile: customer.mobile,
        department: customer.department,
        year: customer.year,
        section: customer.section,
        email: customer.email,
        
      });

      localStorage.setItem(
        "xeroxCustomerId",
        customer._id
      );
      setExistingCustomer(true);

      alert("Customer found!");

    } catch (error) {
      if (error.response?.status === 404) {
        setExistingCustomer(false);
        alert("Customer not found. Please register.");
      } else {
        alert("Verification failed");
      }
    }
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
      if (existingCustomer) {
        navigate("/upload");
        return;
    }


    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/customers`,
        form
      );
      console.log("REGISTER RESPONSE:", response.data);

      console.log(
        "CUSTOMER ID:",
        response.data.customer._id
      );

      localStorage.setItem(
        "xeroxCustomerId",
        response.data.customer._id
      );


      alert("Registration successful!");
      navigate("/upload");

      setForm({
        name: "",
        mobile: "",
        department: "",
        year: "",
        section: "",
        email: "",
      });

    } catch (error) {
      alert(
        error.response?.data?.message || "Registration failed"
      );
    }
  };
  return (
    <div className={styles.container}>
      <form className={styles.form} onSubmit={handleSubmit}>
        <h1>Registration</h1>

        <div>
          <input
            name="mobile"
            placeholder="Mobile Number"
            value={form.mobile}
            onChange={handleChange}
            maxLength="10"
            required
          />

          <button
            type="button"
            onClick={handleVerify}
          >
            Verify
          </button>
        </div>

        <input
          name="name"
          placeholder="Full Name"
          value={form.name}
          onChange={handleChange}
          required
        />



        <select
          name="department"
          value={form.department}
          onChange={handleChange}
          required
        >
          <option value=""  disabled>Department</option>
          <option>Artificial Intelligence & Data Science Engineering</option>
          <option>Automobile Engineering</option>
          <option>Civil Engineering</option>
          <option>Electrical and Electronics Engineering</option>
          <option>Electronics and Communication Engineering</option>
          <option>Information Technology</option>
          <option>Computer Science and Engineering (Cyber Security)</option>
          <option>Computer Science and Engineering</option>
          <option>Mechanical Engineering</option>
          <option>Electronics and Instrumentation Engineering</option>
          <option>Master of Business Administration</option>
        </select>

        <select
          name="year"
          value={form.year}
          onChange={handleChange}
          required
        >
          <option value="">Select Year</option>
          <option value="1">1st Year</option>
          <option value="2">2nd Year</option>
          <option value="3">3rd Year</option>
          <option value="4">4th Year</option>
        </select>

        <select
          name="section"
          value={form.section}
          onChange={handleChange}
          required
        >
          <option value="">Select Section</option>
          <option>A</option>
          <option>B</option>
          <option>C</option>
          <option>D</option>
        </select>

        <input
          type="email"
          name="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          required
        />

<button type="submit">
    {existingCustomer ? "Continue to Upload" : "Register"}
</button>      
</form>
    </div>
  );
}

export default CustomerRegister;