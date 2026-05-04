import React, { useState, useEffect } from 'react';
import './App.css';
import { db } from './firebase';
import { collection, addDoc, onSnapshot, query, orderBy, deleteDoc, doc, getDocs } from 'firebase/firestore';

function App() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState('home'); // 'home', 'menu', 'contact', or 'admin'
  const [activeTab, setActiveTab] = useState('breakfast');
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  const [allOrders, setAllOrders] = useState([]);

  const OWNER_PHONE = "15551234567"; // Replace with your real phone number

  const sendWhatsAppMessage = (message) => {
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${OWNER_PHONE}?text=${encodedMessage}`;
    window.open(whatsappUrl, '_blank');
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    
    // Real-time Firestore sync
    const q = query(collection(db, "orders"), orderBy("timestamp", "desc"));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const orders = [];
      querySnapshot.forEach((doc) => {
        orders.push({ id: doc.id, ...doc.data() });
      });
      setAllOrders(orders);
    });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      unsubscribe();
    };
  }, []);

  const adminLogin = () => {
    const code = prompt("Enter Admin Access Code:");
    if (code === 'admin123') {
      setIsOwner(true);
      setCurrentPage('admin');
      window.scrollTo(0,0);
    } else {
      alert("Incorrect Code!");
    }
  };

  const clearOrders = async () => {
    if (window.confirm("Are you sure you want to clear all orders? This will delete all records from the database.")) {
      try {
        const querySnapshot = await getDocs(collection(db, "orders"));
        const deletePromises = querySnapshot.docs.map(document => deleteDoc(doc(db, "orders", document.id)));
        await Promise.all(deletePromises);
        alert("All orders cleared from database.");
      } catch (error) {
        console.error("Error clearing orders:", error);
        alert("Failed to clear orders.");
      }
    }
  };

  const addToCart = (item) => {
    setCart([...cart, { ...item, id: Date.now() }]);
  };

  const removeFromCart = (id) => {
    setCart(cart.filter(item => item.id !== id));
  };

  const placeOrder = async () => {
    const order = {
      items: cart,
      total: cart.reduce((sum, item) => sum + parseFloat(item.price.replace('$', '')), 0).toFixed(2),
      timestamp: new Date().toLocaleString()
    };

    try {
      await addDoc(collection(db, "orders"), order);
      
      // Send to WhatsApp
      const itemsList = cart.map(item => `- ${item.name} (${item.price})`).join('\n');
      const waMessage = `*New Order from The Cozy Cup Café*\n\n*Items:*\n${itemsList}\n\n*Total:* $${order.total}\n*Time:* ${order.timestamp}`;
      sendWhatsAppMessage(waMessage);

      setCart([]);
      setIsCartOpen(false);
      alert(`Order Placed Successfully!`);
    } catch (error) {
      console.error("Firebase Error Details:", error);
      alert(`Firebase Error: ${error.message}\n\nCommon Fix: Please ensure Firestore is enabled and Security Rules are set to 'Test Mode' in your Firebase Console.`);
    }
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    setFormSubmitted(true);
    
    // Send to WhatsApp
    const message = `*New Inquiry from The Cozy Cup Café*\n\n*Name:* ${formData.name}\n*Email:* ${formData.email}\n*Message:* ${formData.message}`;
    sendWhatsAppMessage(message);

    setFormData({ name: '', email: '', message: '' });
    setTimeout(() => setFormSubmitted(false), 5000);
  };

  const menuData = {
    breakfast: [
      { name: "Classic Omelette", desc: "Three farm eggs with choice of cheese and seasonal veggies.", price: "$12.50", image: "https://placehold.co/150x150/f5a623/white?text=🍳" },
      { name: "Avocado Toast", desc: "Sourdough bread topped with mashed avocado, chili flakes, and poached eggs.", price: "$14.00", image: "https://placehold.co/150x150/4A7C59/white?text=🥑" },
      { name: "French Toast", desc: "Brioche soaked in vanilla bean custard, served with maple syrup.", price: "$11.50", image: "https://placehold.co/150x150/8B4513/white?text=🍞" },
      { name: "Breakfast Burrito", desc: "Scrambled eggs, black beans, avocado, and house-made salsa.", price: "$13.25", image: "https://placehold.co/150x150/c0392b/white?text=🌯" }
    ],
    lunch: [
      { name: "Grilled Panini", desc: "Fresh mozzarella, tomato, basil pesto on toasted ciabatta.", price: "$13.50", image: "https://placehold.co/150x150/4E2C0E/white?text=🥪" },
      { name: "Caesar Salad", desc: "Romaine lettuce, parmesan, croutons, and house-made dressing.", price: "$11.00", image: "https://placehold.co/150x150/4A7C59/white?text=🥗" },
      { name: "Tomato Soup", desc: "Creamy roasted tomato soup served with a side of sourdough.", price: "$9.50", image: "https://placehold.co/150x150/c0392b/white?text=🍲" },
      { name: "Club Sandwich", desc: "Triple-layered classic with turkey, bacon, lettuce, and tomato.", price: "$12.00", image: "https://placehold.co/150x150/f5a623/white?text=🥙" }
    ],
    drinks: [
      { name: "Signature Latte", desc: "Double shot espresso with steamed milk and a hint of vanilla.", price: "$5.50", image: "https://placehold.co/150x150/4E2C0E/white?text=☕" },
      { name: "Iced Matcha", desc: "Premium grade matcha whisked with cold almond milk.", price: "$6.25", image: "https://placehold.co/150x150/4A7C59/white?text=🍵" },
      { name: "Cheesecake", desc: "New York style cheesecake with a berry compote.", price: "$8.00", image: "https://placehold.co/150x150/FFF8F0/4E2C0E?text=🍰" },
      { name: "Chocolate Brownie", desc: "Warm, fudgy brownie served with vanilla bean gelato.", price: "$6.50", image: "https://placehold.co/150x150/2b1707/white?text=🍫" }
    ]
  };

  const renderHome = () => (
    <>
      {/* Hero Section */}
      <header id="home" className="hero" style={{ backgroundImage: "url('/assets/hero.png')" }}>
        <div className="hero-overlay"></div>
        <div className="container hero-content">
          <h2 className="fade-in">Welcome to The Cozy Cup Café</h2>
          <p className="fade-in delay-1">Where every sip feels like home. Experience the warmth of our hand-roasted beans and artisanal pastries.</p>
          <button onClick={() => { setCurrentPage('menu'); window.scrollTo(0,0); }} className="btn btn-primary fade-in delay-2">Explore Menu</button>
        </div>
      </header>

      {/* Popular Items Section */}
      <section id="popular" className="popular-items">
        <div className="container">
          <div className="section-title">
            <h2>Our Popular Items</h2>
            <div className="underline"></div>
          </div>
          
          <div className="items-grid">
            <div className="item-card">
              <div className="card-img-container">
                <img src="/assets/espresso.png" alt="Espresso" />
              </div>
              <h3>Espresso</h3>
              <p>Rich, bold, and perfectly balanced. The heart of our coffee menu.</p>
              <span className="price">$3.50</span>
            </div>

            <div className="item-card">
              <div className="card-img-container">
                <img src="/assets/pancakes.png" alt="Pancakes" />
              </div>
              <h3>Pancakes</h3>
              <p>Fluffy buttermilk pancakes served with maple syrup and fresh berries.</p>
              <span className="price">$8.95</span>
            </div>

            <div className="item-card">
              <div className="card-img-container">
                <img src="/assets/croissant.png" alt="Croissant" />
              </div>
              <h3>Croissant</h3>
              <p>Buttery, flaky, and golden-brown. Baked fresh every morning.</p>
              <span className="price">$4.25</span>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="about-section">
        <div className="container about-grid">
          <div className="about-text">
            <h2>Our Story</h2>
            <p>Founded in 2010, The Cozy Cup Café started with a simple mission: to create a space where the community can gather over a perfect cup of coffee. We source our beans ethically and bake everything in-house with love.</p>
          </div>
          <div className="about-stats">
            <div className="stat">
              <span className="number">10+</span>
              <span className="label">Years</span>
            </div>
            <div className="stat">
              <span className="number">50k+</span>
              <span className="label">Happy Customers</span>
            </div>
          </div>
        </div>
      </section>
    </>
  );

  const renderMenuPage = () => (
    <div className="menu-page">
      <header className="page-header">
        <div className="container">
          <h2>Our Menu</h2>
          <p>Carefully crafted dishes and brews made with the finest local ingredients.</p>
        </div>
      </header>

      <section className="menu-categories">
        <div className="container">
          <div className="tabs">
            <button className={`tab-btn ${activeTab === 'breakfast' ? 'active' : ''}`} onClick={() => setActiveTab('breakfast')}>Breakfast</button>
            <button className={`tab-btn ${activeTab === 'lunch' ? 'active' : ''}`} onClick={() => setActiveTab('lunch')}>Lunch</button>
            <button className={`tab-btn ${activeTab === 'drinks' ? 'active' : ''}`} onClick={() => setActiveTab('drinks')}>Drinks & Desserts</button>
          </div>

          <div className="menu-grid">
            {menuData[activeTab].map((item, index) => (
              <div key={index} className="menu-item-card fade-in">
                <div className="card-img-container">
                  <img src={item.image} alt={item.name} />
                </div>
                <div className="menu-item-info">
                  <h3>{item.name}</h3>
                  <p>{item.desc}</p>
                </div>
                <div className="menu-item-footer">
                  <span className="price">{item.price}</span>
                  <button onClick={() => addToCart(item)} className="add-to-cart-btn">Add to Cart</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Cart Overlay */}
      {isCartOpen && (
        <div className="cart-overlay fade-in">
          <div className="cart-content">
            <div className="cart-header">
              <h2>Your Order</h2>
              <button className="close-cart" onClick={() => setIsCartOpen(false)}>&times;</button>
            </div>
            
            <div className="cart-items">
              {cart.length === 0 ? (
                <p className="empty-cart">Your cart is empty.</p>
              ) : (
                cart.map((item) => (
                  <div key={item.id} className="cart-item">
                    <div className="cart-item-left">
                      <img src={item.image} alt={item.name} className="cart-thumb" />
                      <span>{item.name}</span>
                    </div>
                    <div className="cart-item-right">
                      <span>{item.price}</span>
                      <button onClick={() => removeFromCart(item.id)} className="remove-item">&times;</button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {cart.length > 0 && (
              <div className="cart-footer">
                <div className="cart-total">
                  <span>Total</span>
                  <span>${cart.reduce((sum, item) => sum + parseFloat(item.price.replace('$', '')), 0).toFixed(2)}</span>
                </div>
                <button className="btn btn-primary place-order-btn" onClick={placeOrder}>Place Order</button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );

  const renderContactPage = () => (
    <div className="contact-page">
      <header className="page-header">
        <div className="container">
          <h2>Contact Us</h2>
          <p>We'd love to hear from you. Stop by or send us a message!</p>
        </div>
      </header>

      <section className="contact-section">
        <div className="container">
          <div className="contact-grid">
            <div className="contact-form-container">
              {formSubmitted ? (
                <div className="success-message fade-in">
                  <h3>Thank You!</h3>
                  <p>Your message has been sent successfully. We'll get back to you soon.</p>
                </div>
              ) : (
                <form className="contact-form" onSubmit={handleFormSubmit}>
                  <div className="form-group">
                    <label htmlFor="name">Full Name</label>
                    <input type="text" id="name" required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} placeholder="Enter your name" />
                  </div>
                  <div className="form-group">
                    <label htmlFor="email">Email Address</label>
                    <input type="email" id="email" required value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} placeholder="Enter your email" />
                  </div>
                  <div className="form-group">
                    <label htmlFor="message">Message</label>
                    <textarea id="message" rows="5" required value={formData.message} onChange={(e) => setFormData({...formData, message: e.target.value})} placeholder="How can we help you?"></textarea>
                  </div>
                  <button type="submit" className="btn btn-primary">Send Message</button>
                </form>
              )}
            </div>

            <div className="contact-info">
              <div className="info-item">
                <h3>Visit Us</h3>
                <p>123 Coffee Lane, Brewtown, BT 56789</p>
              </div>
              <div className="info-item">
                <h3>Call Us</h3>
                <p>(555) 123-4567</p>
              </div>
              <div className="info-item">
                <h3>Email Us</h3>
                <p>hello@cozycupcafe.com</p>
              </div>
              <div className="info-item">
                <h3>Follow Us</h3>
                <div className="social-links-minimal">
                  <a href="#">Facebook</a>
                  <a href="#">Instagram</a>
                  <a href="#">Twitter</a>
                </div>
              </div>
            </div>
          </div>

          <div className="map-placeholder">
            <div className="map-overlay">
              <p>Find us in the heart of Brewtown</p>
            </div>
            <iframe 
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3022.2412648750455!2d-73.9878436!3d40.7579747!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89c25855c6480293%3A0x51f14c216819697!2sTimes%20Square!5e0!3m2!1sen!2sus!4v1625000000000!5m2!1sen!2sus" 
              width="100%" 
              height="450" 
              style={{ border: 0, borderRadius: '20px' }} 
              allowFullScreen="" 
              loading="lazy">
            </iframe>
          </div>
        </div>
      </section>
    </div>
  );

  const renderOwnerDashboard = () => (
    <div className="admin-page">
      <header className="page-header">
        <div className="container">
          <h2>Owner Dashboard</h2>
          <p>View and manage your customer orders.</p>
        </div>
      </header>

      <section className="admin-section">
        <div className="container">
          <div className="admin-controls">
            <h3>Total Orders: {allOrders.length}</h3>
            <button className="btn btn-secondary" onClick={clearOrders}>Clear All Orders</button>
          </div>

          <div className="orders-list">
            {allOrders.length === 0 ? (
              <div className="no-orders">
                <p>No orders have been placed yet.</p>
              </div>
            ) : (
              allOrders.slice().reverse().map((order) => (
                <div key={order.id} className="order-card fade-in">
                  <div className="order-header">
                    <span className="order-id">{order.id}</span>
                    <span className="order-time">{order.timestamp}</span>
                  </div>
                  <div className="order-body">
                    <div className="order-items">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="order-item">
                          <div className="order-item-left">
                            <img src={item.image} alt={item.name} className="order-thumb" />
                            <span>{item.name}</span>
                          </div>
                          <span>{item.price}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="order-footer">
                    <strong>Total Amount:</strong>
                    <span className="total-price">${order.total}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>
    </div>
  );

  const renderContent = () => {
    switch(currentPage) {
      case 'menu': return renderMenuPage();
      case 'contact': return renderContactPage();
      case 'admin': return isOwner ? renderOwnerDashboard() : renderHome();
      default: return renderHome();
    }
  };

  return (
    <div className="app">
      {/* Navigation Bar */}
      <nav className={`navbar ${isScrolled || currentPage !== 'home' ? 'scrolled' : ''}`}>
        <div className="container nav-container">
          <div className="logo" onClick={() => setCurrentPage('home')} style={{cursor: 'pointer'}}>
            <h1>Cozy Cup</h1>
          </div>
          
          <ul className={`nav-links ${isMenuOpen ? 'open' : ''}`}>
            <li><button onClick={() => { setCurrentPage('home'); setIsMenuOpen(false); window.scrollTo(0,0); }} className="nav-btn">Home</button></li>
            <li><button onClick={() => { setCurrentPage('home'); setIsMenuOpen(false); setTimeout(() => { document.getElementById('about')?.scrollIntoView({behavior: 'smooth'}) }, 100); }} className="nav-btn">About</button></li>
            <li><button onClick={() => { setCurrentPage('menu'); setIsMenuOpen(false); window.scrollTo(0,0); }} className="nav-btn">Menu</button></li>
            <li><button onClick={() => { setCurrentPage('contact'); setIsMenuOpen(false); window.scrollTo(0,0); }} className="nav-btn">Contact</button></li>
            {isOwner && <li><button onClick={() => { setCurrentPage('admin'); setIsMenuOpen(false); window.scrollTo(0,0); }} className="nav-btn admin-link">Admin Dashboard</button></li>}
            <li>
              <button onClick={() => setIsCartOpen(true)} className="nav-btn cart-btn">
                Cart <span className="cart-count">{cart.length}</span>
              </button>
            </li>
          </ul>

          <div className="menu-toggle" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            <span className="bar"></span>
            <span className="bar"></span>
            <span className="bar"></span>
          </div>
        </div>
      </nav>

      <main>
        {renderContent()}
      </main>

      {/* Footer */}
      <footer id="contact">
        <div className="container footer-content">
          <div className="footer-info">
            <h3>The Cozy Cup Café</h3>
            <p>123 Coffee Lane, Brewtown</p>
            <p>Open Daily: 7am - 8pm</p>
          </div>
          
          <div className="social-links">
            <a href="#" aria-label="Facebook">FB</a>
            <a href="#" aria-label="Instagram">IG</a>
            <a href="#" aria-label="Twitter">TW</a>
          </div>

          <div className="footer-bottom">
            <p>&copy; 2024 The Cozy Cup Café. All rights reserved.</p>
            <button onClick={adminLogin} className="secret-admin-btn">Owner Access</button>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
