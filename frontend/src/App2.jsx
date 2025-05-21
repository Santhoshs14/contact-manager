import React, { useState, useEffect } from "react";
import "./App.css";

const countryCodes = [
  { name: "United States", code: "+1" },
  { name: "India", code: "+91" },
  { name: "United Kingdom", code: "+44" },
  { name: "Canada", code: "+14" },
  { name: "Australia", code: "+61" },
];

const initialFormState = {
  firstName: "",
  lastName: "",
  countryCode: "+1",
  contactNumber: "",
  dob: "",
  email: "",
  picture: "",
};

const App2 = () => {
  const [form, setForm] = useState(initialFormState);
  const [contacts, setContacts] = useState([]);
  const [deletedContacts, setDeletedContacts] = useState([]);
  const [sortBy, setSortBy] = useState("firstName");
  const [editingId, setEditingId] = useState(null);

  const API_URL = "http://localhost:5000/api/contacts";

  useEffect(() => {
    fetchContacts();
    fetchDeletedContacts();
  }, []);

  const fetchContacts = async () => {
    const res = await fetch(API_URL);
    const data = await res.json();
    setContacts(data);
  };

  const fetchDeletedContacts = async () => {
    const res = await fetch("${API_URL}/deleted");
    const data = await res.json();
    setDeletedContacts(data);
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "contactNumber") {
      const cleaned = value.replace(/\D/g, "");
      if (cleaned.length <= 10) setForm({ ...form, contactNumber: cleaned });
    } else if (name === "picture") {
      const reader = new FileReader();
      reader.onload = () => {
        setForm({ ...form, picture: reader.result });
      };
      reader.readAsDataURL(files[0]);
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const validateForm = () => {
    const nameRegex = /^[A-Z][a-zA-Z]{0,49}$/;
    const emailRegex = /^[a-zA-Z0-9.]+@[a-zA-Z0-9.]+$/;

    if (!nameRegex.test(form.firstName)) {
      alert(
        "First name must start with a capital letter and only contain alphabets (max 50 chars)."
      );
      return false;
    }

    if (!nameRegex.test(form.lastName)) {
      alert(
        "Last name must start with a capital letter and only contain alphabets (max 50 chars)."
      );
      return false;
    }

    if (form.contactNumber.length !== 10 || form.contactNumber[0] === "0") {
      alert("Contact number must be 10 digits and not start with 0.");
      return false;
    }

    if (
      !emailRegex.test(form.email) ||
      (form.email.match(/@/g) || []).length !== 1
    ) {
      alert(
        "Email must be valid and contain exactly one '@' with no special characters other than '.' and '@'."
      );
      return false;
    }

    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) return;
    const res = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      fetchContacts();
      setForm(initialFormState);
    }
  };

  const handleEdit = (contact) => {
    setEditingId(contact.id);
    setForm({ ...contact });
  };

  const handleUpdate = async () => {
    if (!validateForm()) return;
    const res = await fetch(`\${API_URL}/\${editingId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      setEditingId(null);
      setForm(initialFormState);
      fetchContacts();
    }
  };

  const handleDelete = async (id) => {
    await fetch(`\${API_URL}/delete/\${id}`, { method: "PUT" });
    fetchContacts();
    fetchDeletedContacts();
  };

  const handleRecover = async (id) => {
    await fetch(`\${API_URL}/recover/\${id}`, { method: "PUT" });
    fetchContacts();
    fetchDeletedContacts();
  };

  const handlePermanentDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to permanently delete this contact? This cannot be undone."
    );
    if (!confirmDelete) return;

    await fetch(`\${API_URL}/permanent/\${id}`, { method: "DELETE" });
    fetchContacts();
    fetchDeletedContacts();
  };

  const sortedContacts = [...contacts].sort((a, b) => {
    if (sortBy === "dob") return new Date(a.dob) - new Date(b.dob);
    return a[sortBy].localeCompare(b[sortBy]);
  });

  return (
    <div className="container">
      <h1>Contact Manager</h1>
      <div className="form">
        <input
          type="text"
          name="firstName"
          placeholder="First Name"
          maxLength="50"
          value={form.firstName}
          onChange={handleChange}
        />
        <input
          type="text"
          name="lastName"
          placeholder="Last Name"
          maxLength="50"
          value={form.lastName}
          onChange={handleChange}
        />
        <select
          name="countryCode"
          value={form.countryCode}
          onChange={handleChange}
        >
          {countryCodes.map((c) => (
            <option key={c.code} value={c.code}>
              {c.name} ({c.code})
            </option>
          ))}
        </select>
        <input
          type="text"
          name="contactNumber"
          placeholder="10-digit Contact Number"
          value={form.contactNumber}
          onChange={handleChange}
        />
        <input
          type="date"
          name="dob"
          value={form.dob}
          onChange={handleChange}
        />
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
        />
        <input
          type="file"
          name="picture"
          accept="image/*"
          onChange={handleChange}
        />
        {editingId ? (
          <button onClick={handleUpdate}>Update</button>
        ) : (
          <button onClick={handleSave}>Save Contact</button>
        )}
      </div>
      <div className="sort">
        <label>Sort By:</label>
        <select onChange={(e) => setSortBy(e.target.value)} value={sortBy}>
          <option value="firstName">First Name</option>
          <option value="lastName">Last Name</option>
          <option value="dob">Date of Birth</option>
        </select>
      </div>
      <h2>Contact List</h2>
      <div className="contact-list">
        {sortedContacts.map((c) => (
          <div className="contact-card" key={c.id}>
            {c.picture && <img src={c.picture} alt="avatar" />}
            <div>
              <p>
                <strong>
                  {c.firstName} {c.lastName}
                </strong>
              </p>
              <p>
                {c.countryCode} {c.contactNumber}
              </p>
              <p>DOB: {c.dob}</p>
              <p>{c.email}</p>
            </div>
            <button onClick={() => handleEdit(c)}>Edit</button>
            <button onClick={() => handleDelete(c.id)}>Soft Delete</button>
            <button
              onClick={() => handlePermanentDelete(c.id)}
              className="perma-delete"
            >
              Permanently Delete
            </button>
          </div>
        ))}
      </div>
      {deletedContacts.length > 0 && (
        <>
          <h2>Recover Contacts</h2>
          <div className="contact-list deleted">
            {deletedContacts.map((c) => (
              <div className="contact-card" key={c.id}>
                {c.picture && <img src={c.picture} alt="avatar" />}
                <div>
                  <p>
                    <strong>
                      {c.firstName} {c.lastName}
                    </strong>
                  </p>
                  <p>
                    {c.countryCode} {c.contactNumber}
                  </p>
                  <p>DOB: {c.dob}</p>
                  <p>{c.email}</p>
                </div>
                <button onClick={() => handleRecover(c.id)}>Recover</button>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default App2;
