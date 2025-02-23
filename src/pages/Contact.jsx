import { useState } from "react";

function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    console.log('Kenttä päivitetty: ${name}, uusi arvo: ${value}');
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Lomake lähetetty seuraavilla tiedoilla:', formData);
    alert(`Kiitos yhteydenotosta, ${formData.name}!`);
  };

  return (
    <div className="contact-container">
      <h1>Ota yhteyttä</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="name">Nimi:</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label htmlFor="email">Sähköposti:</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label htmlFor="message">Viesti:</label>
          <textarea
            id="message"
            name="message"
            rows="4"
            value={formData.message}
            onChange={handleChange}
            required
          ></textarea>
        </div>
        <button type="submit">Lähetä</button>
      </form>
    </div>
  );
}

export default Contact;
