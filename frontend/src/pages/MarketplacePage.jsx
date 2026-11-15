import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { Alert } from '../components/ui/Alert';
import { apiClient } from '../api/client';
import { ShoppingBag, ShoppingCart, CheckCircle, Search, Trash2, ArrowRight, Star, MapPin } from 'lucide-react';

export function MarketplacePage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Cart state
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  // Checkout form
  const [guestName, setGuestName] = useState('Alexandra Vance');
  const [guestEmail, setGuestEmail] = useState('alexandra@premierhotels.com');
  const [paymentMethod, setPaymentMethod] = useState('CREDIT_CARD');

  const [checkoutSuccess, setCheckoutSuccess] = useState(null);
  const [checkoutError, setCheckoutError] = useState(null);

  const fetchCatalog = async () => {
    setLoading(true);
    try {
      const data = await apiClient('/marketplace/products', {
        params: selectedCategory ? { category: selectedCategory } : {},
      });
      setProducts(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load marketplace products:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCatalog();
  }, [selectedCategory]);

  const addToCart = (product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
    setIsCartOpen(true);
  };

  const removeFromCart = (productId) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const cartTotal = cart.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  const handleExecuteCheckout = async (e) => {
    e.preventDefault();
    setCheckoutError(null);
    try {
      const res = await apiClient('/marketplace/checkout', {
        method: 'POST',
        data: {
          guest_name: guestName,
          guest_email: guestEmail,
          payment_method: paymentMethod,
          items: cart.map((c) => ({
            product_id: c.product.id,
            quantity: c.quantity,
          })),
        },
      });

      setCheckoutSuccess({
        order_number: res.order_number,
        total: res.total_amount,
        itemsCount: cart.length,
      });
      setCart([]);
      setIsCheckoutOpen(false);
    } catch (err) {
      setCheckoutError(err.message || 'Checkout transaction failed');
    }
  };

  const filteredProducts = products.filter((p) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return p.title.toLowerCase().includes(q) || p.destination.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-indigo-400" />
            Travel Services & Experiences Marketplace
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Authoritative inventory catalog of hotels, executive airport transfers, and verified luxury excursions
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <Button
            variant={cart.length > 0 ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setIsCartOpen(true)}
            leftIcon={<ShoppingCart className="w-3.5 h-3.5" />}
          >
            Cart ({cart.reduce((sum, i) => sum + i.quantity, 0)}) • ${cartTotal.toFixed(2)}
          </Button>
        </div>
      </div>

      {checkoutSuccess && (
        <Alert variant="success" icon={<CheckCircle className="w-4 h-4" />}>
          Order <strong>{checkoutSuccess.order_number}</strong> confirmed! Total of $
          {checkoutSuccess.total.toFixed(2)} charged and persisted to transactional order register.
        </Alert>
      )}

      {/* Filter and Search Bar */}
      <Card className="border-slate-800">
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3">
          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
            <div className="relative min-w-[240px]">
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-3" />
              <Input
                placeholder="Search destination or experience..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 text-xs py-1.5"
              />
            </div>

            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value="">All Categories</option>
              <option value="HOTEL">Hotels & Resorts</option>
              <option value="TRANSFER">Airport Transfers</option>
              <option value="TOUR">Tours & Experiences</option>
            </select>
          </div>

          <div className="text-xs text-slate-400 font-mono">
            {filteredProducts.length} Verified Products
          </div>
        </CardHeader>

        {/* Product Cards Grid */}
        <CardContent className="pt-0">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[1, 2, 3].map((n) => (
                <div key={n} className="h-64 bg-slate-800/40 animate-pulse rounded-xl" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {filteredProducts.map((p) => (
                <div
                  key={p.id}
                  className="bg-slate-950/80 border border-slate-800 rounded-xl overflow-hidden flex flex-col justify-between hover:border-slate-700 transition-colors"
                >
                  <div className="p-4 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <Badge variant="primary" size="xs">
                        {p.category}
                      </Badge>
                      <div className="flex items-center gap-1 text-xs text-amber-400 font-bold">
                        <Star className="w-3 h-3 fill-amber-400" />
                        <span>{p.rating}</span>
                      </div>
                    </div>

                    <div>
                      <h3 className="font-semibold text-slate-100 text-sm">{p.title}</h3>
                      <div className="flex items-center gap-1 text-xs text-slate-400 mt-1">
                        <MapPin className="w-3 h-3 text-slate-500" />
                        <span>{p.destination}</span>
                      </div>
                    </div>

                    <p className="text-xs text-slate-400 leading-relaxed">{p.description}</p>
                  </div>

                  <div className="p-4 border-t border-slate-800/80 bg-slate-900/40 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-500 uppercase block">Price</span>
                      <span className="text-base font-bold font-mono text-emerald-400">
                        ${p.price.toFixed(2)}
                      </span>
                    </div>
                    <Button
                      variant="primary"
                      size="xs"
                      onClick={() => addToCart(p)}
                      leftIcon={<ShoppingCart className="w-3 h-3" />}
                    >
                      Add to Cart
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Cart Drawer Modal */}
      {isCartOpen && (
        <Modal
          isOpen={isCartOpen}
          onClose={() => setIsCartOpen(false)}
          title="Marketplace Cart"
          subtitle={`${cart.length} unique services selected`}
        >
          <div className="space-y-4 text-xs">
            {cart.length === 0 ? (
              <p className="text-slate-400 italic text-center py-6">Your cart is empty.</p>
            ) : (
              <div className="space-y-2.5">
                {cart.map((item) => (
                  <div
                    key={item.product.id}
                    className="p-3 bg-slate-950 border border-slate-800 rounded-lg flex items-center justify-between"
                  >
                    <div>
                      <div className="font-semibold text-slate-200">{item.product.title}</div>
                      <div className="text-slate-500 text-[11px]">
                        ${item.product.price} × {item.quantity}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-mono font-bold text-slate-100">
                        ${(item.product.price * item.quantity).toFixed(2)}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeFromCart(item.product.id)}
                        className="text-slate-500 hover:text-rose-400 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}

                <div className="pt-3 border-t border-slate-800 flex justify-between items-center text-sm">
                  <span className="font-semibold text-slate-300">Total:</span>
                  <span className="font-bold font-mono text-emerald-400 text-base">
                    ${cartTotal.toFixed(2)}
                  </span>
                </div>
              </div>
            )}

            <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
              <Button variant="secondary" size="sm" onClick={() => setIsCartOpen(false)}>
                Continue Browsing
              </Button>
              {cart.length > 0 && (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => {
                    setIsCartOpen(false);
                    setIsCheckoutOpen(true);
                  }}
                  rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
                >
                  Proceed to Checkout
                </Button>
              )}
            </div>
          </div>
        </Modal>
      )}

      {/* Checkout Modal */}
      {isCheckoutOpen && (
        <Modal
          isOpen={isCheckoutOpen}
          onClose={() => setIsCheckoutOpen(false)}
          title="Confirm Marketplace Booking"
          subtitle={`Total due: $${cartTotal.toFixed(2)}`}
        >
          {checkoutError && <Alert variant="danger">{checkoutError}</Alert>}
          <form onSubmit={handleExecuteCheckout} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Guest Full Name</label>
              <Input
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Confirmation Email</label>
              <Input
                type="email"
                value={guestEmail}
                onChange={(e) => setGuestEmail(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Payment Method</label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 text-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                <option value="CREDIT_CARD">Credit Card</option>
                <option value="CORPORATE_EXPENSE">Charge to Corporate Travel Account</option>
                <option value="LOYALTY_POINTS">Redeem Loyalty Points</option>
              </select>
            </div>

            <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg text-xs space-y-1">
              <div className="flex justify-between text-slate-400">
                <span>Items Subtotal:</span>
                <span className="font-mono text-slate-200">${cartTotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Taxes & Partner Fees:</span>
                <span className="font-mono text-slate-200">$0.00</span>
              </div>
              <div className="flex justify-between text-slate-200 font-bold pt-1 border-t border-slate-800">
                <span>Total Amount:</span>
                <span className="font-mono text-emerald-400">${cartTotal.toFixed(2)}</span>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
              <Button variant="secondary" size="sm" onClick={() => setIsCheckoutOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="sm">
                Commit Order & Pay
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
