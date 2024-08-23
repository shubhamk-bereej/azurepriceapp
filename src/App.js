import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Cloud } from 'lucide-react';

const regions = [
  { value: 'eastus', label: 'East US' },
  { value: 'westus', label: 'West US' },
  { value: 'northeurope', label: 'North Europe' },
  { value: 'westeurope', label: 'West Europe' },
  { value: 'southeastasia', label: 'Southeast Asia' },
];

const priceTypes = ['Consumption', 'Reservation'];
const currencies = ['USD', 'EUR', 'GBP', 'AUD'];

export default function App() {
  const [services, setServices] = useState([]);
  const [products, setProducts] = useState([]);
  const [armSkus, setArmSkus] = useState([]);
  const [skus, setSkus] = useState([]);
  const [selectedService, setSelectedService] = useState('');
  const [selectedProduct, setSelectedProduct] = useState('');
  const [selectedArmSku, setSelectedArmSku] = useState('');
  const [selectedSku, setSelectedSku] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('eastus');
  const [selectedPriceType, setSelectedPriceType] = useState('Consumption');
  const [selectedCurrency, setSelectedCurrency] = useState('USD');
  const [prices, setPrices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (selectedService) {
      fetchProducts();
    }
  }, [selectedService]);

  useEffect(() => {
    if (selectedProduct) {
      fetchArmSkus();
    }
  }, [selectedService, selectedProduct]);

  useEffect(() => {
    if (selectedArmSku) {
      fetchSkus();
    }
  }, [selectedService, selectedProduct, selectedArmSku]);

  const fetchData = async (filterString) => {
    setLoading(true);
    setError('');
    try {
      const params = {};
      if (filterString) {
        params['$filter'] = filterString;
      }
      const response = await axios.get('/api/retail/prices', { params });
      return response.data.Items;
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to fetch data. Please try again.');
      return [];
    } finally {
      setLoading(false);
    }
  };

  const fetchInitialData = async () => {
    const items = await fetchData();
    const uniqueServices = [...new Set(items.map(item => item.serviceName))];
    setServices(uniqueServices);
  };

  const fetchProducts = async () => {
    const filter = `serviceName eq '${selectedService}'`;
    const items = await fetchData(filter);
    const uniqueProducts = [...new Set(items.map(item => item.productName))];
    setProducts(uniqueProducts);
  };

  const fetchArmSkus = async () => {
    const filter = `serviceName eq '${selectedService}' and productName eq '${selectedProduct}'`;
    const items = await fetchData(filter);
    const uniqueArmSkus = [...new Set(items.map(item => item.armSkuName))];
    setArmSkus(uniqueArmSkus);
  };

  const fetchSkus = async () => {
    const filter = `serviceName eq '${selectedService}' and productName eq '${selectedProduct}' and armSkuName eq '${selectedArmSku}'`;
    const items = await fetchData(filter);
    const uniqueSkus = [...new Set(items.map(item => item.skuName))];
    setSkus(uniqueSkus);
  };

  const fetchPricing = async () => {
    let filter = [
      `serviceName eq '${selectedService}'`,
      `productName eq '${selectedProduct}'`,
      `priceType eq '${selectedPriceType}'`,
      `armRegionName eq '${selectedRegion}'`
    ];
    if (selectedArmSku) filter.push(`armSkuName eq '${selectedArmSku}'`);
    if (selectedSku) filter.push(`skuName eq '${selectedSku}'`);
    const items = await fetchData(filter.join(' and '));
    setPrices(items);
  };

  const handleChange = async (setter, value, level) => {
    setter(value);
    setPrices([]);

    switch (level) {
      case 'service':
        setSelectedProduct('');
        setSelectedArmSku('');
        setSelectedSku('');
        setProducts([]);
        setArmSkus([]);
        setSkus([]);
        if (value) await fetchProducts();
        break;
      case 'product':
        setSelectedArmSku('');
        setSelectedSku('');
        setArmSkus([]);
        setSkus([]);
        if (value) await fetchArmSkus();
        break;
      case 'armSku':
        setSelectedSku('');
        setSkus([]);
        if (value) await fetchSkus();
        break;
      default:
        break;
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6 text-center flex items-center justify-center">
        <Cloud className="inline-block mr-2" />
        Azure Pricing Calculator
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <select
          value={selectedService}
          onChange={(e) => handleChange(setSelectedService, e.target.value, 'service')}
          className="p-2 border rounded"
        >
          <option value="">All Services</option>
          {services.map((service, index) => (
            <option key={index} value={service}>{service}</option>
          ))}
        </select>

        <select
          value={selectedProduct}
          onChange={(e) => handleChange(setSelectedProduct, e.target.value, 'product')}
          className="p-2 border rounded"
        >
          <option value="">All Products</option>
          {products.map((product, index) => (
            <option key={index} value={product}>{product}</option>
          ))}
        </select>

        <select
          value={selectedArmSku}
          onChange={(e) => handleChange(setSelectedArmSku, e.target.value, 'armSku')}
          className="p-2 border rounded"
        >
          <option value="">All ARM SKUs</option>
          {armSkus.map((sku, index) => (
            <option key={index} value={sku}>{sku}</option>
          ))}
        </select>

        <select
          value={selectedSku}
          onChange={(e) => handleChange(setSelectedSku, e.target.value, 'sku')}
          className="p-2 border rounded"
        >
          <option value="">All SKUs</option>
          {skus.map((sku, index) => (
            <option key={index} value={sku}>{sku}</option>
          ))}
        </select>

        <select
          value={selectedRegion}
          onChange={(e) => setSelectedRegion(e.target.value)}
          className="p-2 border rounded"
        >
          {regions.map((region) => (
            <option key={region.value} value={region.value}>{region.label}</option>
          ))}
        </select>

        <select
          value={selectedPriceType}
          onChange={(e) => setSelectedPriceType(e.target.value)}
          className="p-2 border rounded"
        >
          {priceTypes.map((type) => (
            <option key={type} value={type}>{type}</option>
          ))}
        </select>

        <select
          value={selectedCurrency}
          onChange={(e) => setSelectedCurrency(e.target.value)}
          className="p-2 border rounded"
        >
          {currencies.map((curr) => (
            <option key={curr} value={curr}>{curr}</option>
          ))}
        </select>

        <button
          onClick={fetchPricing}
          className="p-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors duration-200"
        >
          {loading ? 'Loading...' : 'Get Pricing'}
        </button>
      </div>

      {error && (
        <p className="text-red-500 mb-4">{error}</p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {prices.map((price, index) => (
          <div key={index} className="border p-4 rounded shadow">
            <h3 className="text-xl font-semibold mb-2">{price.skuName}</h3>
            <p className="mb-1">Retail Price: {price.retailPrice} {price.currencyCode}</p>
            <p>Unit of Measure: {price.unitOfMeasure}</p>
          </div>
        ))}
      </div>
    </div>
  );
}