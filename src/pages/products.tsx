import React, { useEffect, useState } from "react";

interface Product {
  id: number;
  name: string;
  description: string;
  epic_id: string;
}

interface ProductListsProps {
  showForm: (product: Product | null) => void;
}

interface ProductFormProps {
  showList: () => void;
  product: Product | null;
}

export function Products() {
  const [content, setContent] = useState(<ProductLists showForm={showForm} />);

  function showList() {
    setContent(<ProductLists showForm={showForm} />);
  }

  function showForm(product: Product | null) {
    setContent(<ProductForm product={product} showList={showList} />);
  }

  return <div className="container my-5">{content}</div>;
}

function ProductLists(props: ProductListsProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [order, setOrder] = useState<"desc" | "asc">("asc");
  const [searchQuery, setSearchQuery] = useState("");
  const [offset, setOffset] = useState<number>(0);
  const [limit] = useState<number>(5);
  function sortBy(sortby: string) {
    if (order == "asc") {
      setOrder("desc");
    } else {
      setOrder("asc");
    }
    fetch(`http://localhost:8000/tasks?sort_by=${sortby}}&order=${order}`)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Unexpected Server Response");
        }
        return response.json();
      })
      .then((data) => {
        // console.log(data);
        setProducts(data);
      })
      .catch((error) => console.log("Error: ", error));
  }
  function fetchProducts() {
    fetch(`http://localhost:8000/tasks?limit=${limit}&offset=${offset}`)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Unexpected Server Response");
        }
        return response.json();
      })
      .then((data) => {
        console.log(data);
        setProducts(data);
      })
      .catch((error) => console.log("Error: ", error));
  }

  useEffect(() => {
    fetchProducts();
  }, [offset]);

  function deleteProduct(id: number) {
    fetch("http://localhost:8000/tasks/" + id, {
      method: "DELETE",
    })
      .then((response) => response.json())
      .then(() => fetchProducts());
  }
  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  function handleNextPage() {
    setOffset(offset + limit);
  }

  function handlePrevPage() {
    if (offset > 0) {
      setOffset(offset - limit);
    }
  }
  return (
    <>
      <h2 className="text-center mb-3">List of Products</h2>
      <div className="mb-3">
        <input
          type="text"
          className="form-control"
          placeholder="Search by Name"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
      <button
        onClick={() => props.showForm(null)}
        type="button"
        className="btn btn-primary me-2"
      >
        Create
      </button>
      <button
        onClick={() => fetchProducts()}
        type="button"
        className="btn btn-outline-primary me-2"
      >
        Refresh
      </button>
      <table className="table">
        <thead>
          <tr>
            <th onClick={() => sortBy("id")}>ID</th>
            <th onClick={() => sortBy("name")}>Name</th>
            <th>Description</th>
            <th>EpicID</th>
          </tr>
        </thead>
        <tbody>
          {filteredProducts.map((product, index) => (
            <tr key={index}>
              <td>{product.id}</td>
              <td>{product.name}</td>
              <td>{product.description}</td>
              <td>{product.epic_id}</td>
              <td style={{ width: "10px", whiteSpace: "nowrap" }}>
                <button
                  onClick={() => props.showForm(product)}
                  type="button"
                  className="btn btn-primary btn-sm me-2"
                >
                  Edit
                </button>
                <button
                  onClick={() => deleteProduct(product.id)}
                  type="button"
                  className="btn btn-danger btn-sm"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="pagination">
        <button onClick={handlePrevPage} disabled={offset === 0}>
          Previous
        </button>
        <button onClick={handleNextPage} disabled={products.length < limit}>
          Next
        </button>
      </div>
    </>
  );
}

function ProductForm(props: ProductFormProps) {
  const [errorMessage, setErrorMessage] = useState("");

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.target as HTMLFormElement);

    const product = Object.fromEntries(formData.entries());

    if (!product.name || !product.epic_id || !product.description) {
      setErrorMessage("Please provide all the required fields");
      return;
    }

    if (props.product?.id) {
      product.createdAt = new Date().toISOString().slice(0, 10); // Ispravka
      fetch("http://localhost:8000/tasks/" + props.product.id, {
        method: "PUT", // Trebalo bi da bude PUT za izmenu
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(product),
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error("Network response was not OK");
          }
          return response.json();
        })
        .then((data) => {
          props.showList();
        });
    } else {
      product.createdAt = new Date().toISOString().slice(0, 10); // Ispravka
      console.log(product);
      fetch("http://localhost:8000/tasks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(product),
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error("Network response was not OK");
          }
          return response.json();
        })
        .then((data) => {
          props.showList();
        });
    }
  }

  return (
    <>
      <h2 className="text-center mb-3">
        {props.product?.id ? "Edit Product" : "Create New Product"}
      </h2>

      <div className="row">
        <div className="col-lg-6 mx-auto">
          {errorMessage && (
            <div className="alert alert-danger">{errorMessage}</div>
          )}

          <form onSubmit={(event) => handleSubmit(event)}>
            {props.product?.id && (
              <div className="row mb-3">
                <label className="col-sm-4 col-form-label">ID</label>
                <div>
                  <input
                    className="form-control"
                    name="id"
                    defaultValue={props.product?.id}
                  />
                </div>
              </div>
            )}

            <div className="row mb-3">
              <label className="col-sm-4 col-form-label">EpicID</label>
              <div>
                <input
                  className="form-control"
                  name="epic_id"
                  defaultValue={props.product?.epic_id}
                />
              </div>
            </div>

            <div className="row mb-3">
              <label className="col-sm-4 col-form-label">Name</label>
              <div>
                <input
                  className="form-control"
                  name="name"
                  defaultValue={props.product?.name}
                />
              </div>
            </div>

            <div className="row mb-3">
              <label className="col-sm-4 col-form-label">Description</label>
              <div>
                <textarea
                  className="form-control"
                  name="description"
                  defaultValue={props.product?.description}
                />
              </div>
            </div>

            <div className="row">
              <div className="offset-sm-4 col-sm-4 d-grid">
                <button type="submit" className="btn btn-primary btn-sm me-3">
                  Save
                </button>
              </div>
              <div className="col-sm-4 d-grid">
                <button
                  onClick={() => props.showList()}
                  type="button"
                  className="btn btn-secondary me-2"
                >
                  Cancel
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
