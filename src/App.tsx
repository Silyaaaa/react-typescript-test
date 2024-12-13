import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, useNavigate, useParams, Navigate } from "react-router-dom";
import { Provider, useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { Card, Button, Typography, Space, Input, Form, Pagination, Modal } from "antd";
import { DeleteOutlined, HeartOutlined, HeartFilled, EditOutlined } from "@ant-design/icons";
import { Product, ProductState } from './types';
import store from './redux/store';
import { actions } from './redux/store';
import { API_URL } from './config';

// Hooks
const useProducts = () => useSelector((state: { products: ProductState }) => state.products.products);
const useAppDispatch = () => useDispatch<typeof store.dispatch>();


// ProductCard Component
const ProductCard: React.FC<{ product: Product }> = ({ product }) => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  return (
    <Card
      hoverable
      style={{ width: 300, margin: "10px" }}
      cover={<img alt={product.title} src={product.image} style={{ height: 200, objectFit: "cover" }} />}
      onClick={() => navigate(`/products/${product.id}`)}
    >
      <Typography.Title level={5} ellipsis={{ rows: 2 }}>
        {product.title}
      </Typography.Title>
      <Typography.Paragraph ellipsis={{ rows: 3 }}>
        {product.description}
      </Typography.Paragraph>
      <Space>
        <Button
          type="text"
          icon={product.liked ? <HeartFilled style={{ color: "red" }} /> : <HeartOutlined />}
          onClick={(e) => {
            e.stopPropagation();
            dispatch(actions.toggleLike(product.id));
          }}
        />
        <Button
          type="text"
          icon={<DeleteOutlined style={{ color: "red" }} />}
          onClick={(e) => {
            e.stopPropagation();
            dispatch(actions.deleteProduct(product.id));
          }}
        />
        <Button
          type="text"
          icon={<EditOutlined />}
          onClick={(e) => {
            e.stopPropagation();
            Modal.confirm({
              title: "Редактировать продукт",
              content: (
                <Form
                  onFinish={(values) => {
                    dispatch(actions.editProduct({ id: product.id, updatedProduct: values }));
                    Modal.destroyAll();
                  }}
                  initialValues={product}
                >
                  <Form.Item name="title" rules={[{ required: true, message: "Пожалуйста, введите название" }]}>
                    <Input placeholder="Название" />
                  </Form.Item>
                  <Form.Item name="description">
                    <Input.TextArea placeholder="Описание" rows={3} />
                  </Form.Item>
                  <Button htmlType="submit" type="primary">Сохранить</Button>
                </Form>
              ),
            });
          }}
        />
      </Space>
    </Card>
  );
};

// ProductList Component
const ProductList: React.FC = () => {
  const products = useProducts();
  const dispatch = useAppDispatch();
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const navigate = useNavigate();
  const pageSize = 5;

  const isLoaded = useSelector((state: { products: ProductState }) => state.products.isLoaded);

  useEffect(() => {
    if (!isLoaded && API_URL) {
      axios.get(API_URL).then((response) => {
        dispatch(actions.setProducts(response.data.map((product: any) => ({ ...product, liked: false }))));
      });
    }
  }, [dispatch, isLoaded]);

  const filteredProducts = products
    .filter((product) => (filter === "favorites" ? product.liked : true))
    .filter((product) => product.title.toLowerCase().includes(search.toLowerCase()));

  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  return (
    <div style={{ padding: 20 }}>
      <div style={{ marginBottom: 20, display: "flex", justifyContent: "space-between" }}>
        <div>
          <Button onClick={() => setFilter("all")} type={filter === "all" ? "primary" : "default"}>
            Все
          </Button>
          <Button
            onClick={() => setFilter("favorites")}
            type={filter === "favorites" ? "primary" : "default"}
            style={{ marginLeft: 10 }}
          >
            Избранное
          </Button>
          <Input
            placeholder="Поиск"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: 200, marginLeft: 20 }}
          />
        </div>
        <Button type="primary" onClick={() => navigate("/create-product")}>Создать продукт</Button>
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "20px" }}>
        {paginatedProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
      <Pagination
        current={currentPage}
        pageSize={pageSize}
        total={filteredProducts.length}
        onChange={(page) => setCurrentPage(page)}
        style={{ marginTop: 20, textAlign: "center" }}
      />
    </div>
  );
};


// ProductDetail Component
const ProductDetail: React.FC<{ id: string }> = ({ id }) => {
  const product = useProducts().find((p) => p.id === parseInt(id));
  const navigate = useNavigate();

  if (!product) return <Typography.Text>Продукт не найден.</Typography.Text>;

  return (
    <div style={{ padding: 20 }}>
      <Button onClick={() => navigate("/products")}>Назад</Button>
      <Typography.Title>{product.title}</Typography.Title>
      <img src={product.image} alt={product.title} style={{ maxWidth: "100%", height: 300 }} />
      <Typography.Paragraph>{product.description}</Typography.Paragraph>
    </div>
  );
};

// CreateProduct Component
const CreateProduct: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const handleFinish = (values: Omit<Product, "id" | "liked">) => {
    // Добавление нового продукта
    const newProduct = { ...values, id: Date.now(), liked: false };
    dispatch(actions.addProduct(newProduct)); // Обновление хранилища
    navigate("/products"); // Перенаправление на список продуктов
  };

  return (
    <div style={{ padding: 20 }}>
      <Typography.Title>Создать продукт</Typography.Title>
      <Form onFinish={handleFinish} layout="vertical">
        <Form.Item
          name="title"
          label="Название"
          rules={[{ required: true, message: "Название обязательно" }]}
        >
          <Input placeholder="Название" />
        </Form.Item>
        <Form.Item
          name="description"
          label="Описание"
          rules={[{ required: true, message: "Описание обязательно" }]}
        >
          <Input.TextArea placeholder="Описание" rows={3} />
        </Form.Item>
        <Form.Item
          name="image"
          label="Ссылка на изображение"
          rules={[{ required: true, message: "Ссылка на изображение обязательна" }]}
        >
          <Input placeholder="Ссылка на изображение" />
        </Form.Item>
        <Button type="primary" htmlType="submit">
          Создать
        </Button>
      </Form>
    </div>
  );
};


// App Component
const App: React.FC = () => {
  return (
    <Provider store={store}>
      <Router>
        <Routes>
          <Route path="/" element={<Navigate to="/products" />} />
          <Route path="/products" element={<ProductList />} />
          <Route path="/products/:id" element={<RouteRenderer />} />
          <Route path="/create-product" element={<CreateProduct />} />
        </Routes>
      </Router>
    </Provider>
  );
};

// RouteRenderer Helper
const RouteRenderer = () => {
  const { id } = useParams<{ id: string }>();
  return id ? <ProductDetail id={id} /> : null;
};

export default App;