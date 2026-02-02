import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductService, Product } from '../../services/product.service';
import { AuthService } from '../../services/auth.service';
import { ShopService } from '../../services/shop.service';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-my-products',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './my-products.component.html',
  styleUrls: ['./my-products.component.css']
})
export class MyProductsComponent implements OnInit {
  products: Product[] = [];
  showModal = false;
  isEditing = false;
  isLoading = false;
  
  currentProduct: any = this.getEmptyProduct();
  selectedFiles: File[] = [];
  shopId: string | null = null;

  constructor(
    private productService: ProductService,
    private authService: AuthService,
    private shopService: ShopService
  ) {}

  ngOnInit() {
    this.authService.currentUser$.subscribe(user => {
      if (user) {
        this.findUserShop(user._id);
      }
    });
  }

  findUserShop(userId: string) {
    this.shopService.getShops().subscribe(shops => {
      const myShop = shops.find((s: any) => {
         const ownerId = typeof s.owner_user_id === 'object' ? s.owner_user_id._id : s.owner_user_id;
         return ownerId === userId;
      });
      
      if (myShop) {
        this.shopId = myShop._id;
        this.loadProducts();
      }
    });
  }

  getEmptyProduct() {
    return {
      name: '',
      description: '',
      category: '',
      price: { current: 0, currency: 'EUR' },
      stock: { quantity: 0, status: 'in_stock' },
      images: []
    };
  }

  loadProducts() {
    if (!this.shopId) return;
    this.productService.getProducts({ shop_id: this.shopId }).subscribe(data => {
      this.products = data;
    });
  }

  openModal() {
    this.isEditing = false;
    this.currentProduct = this.getEmptyProduct();
    this.selectedFiles = [];
    this.showModal = true;
  }

  editProduct(product: Product) {
    this.isEditing = true;
    // Deep copy to avoid reference issues with nested objects
    this.currentProduct = JSON.parse(JSON.stringify(product));
    this.selectedFiles = [];
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
  }

  onFileSelected(event: any) {
    if (event.target.files) {
      this.selectedFiles = Array.from(event.target.files);
    }
  }

  saveProduct() {
    if (!this.shopId) {
      alert('Shop not found for this user.');
      return;
    }
    
    this.isLoading = true;
    const formData = new FormData();
    
    // Append basic fields
    formData.append('shop_id', this.shopId);
    formData.append('name', this.currentProduct.name);
    formData.append('description', this.currentProduct.description || '');
    formData.append('category', this.currentProduct.category || '');
    
    // Append nested objects as JSON strings
    formData.append('price', JSON.stringify(this.currentProduct.price));
    formData.append('stock', JSON.stringify(this.currentProduct.stock));
    
    if (this.currentProduct.promotion) {
      formData.append('promotion', JSON.stringify(this.currentProduct.promotion));
    }

    // Append images
    this.selectedFiles.forEach((file) => {
      formData.append('images', file);
    });

    if (this.isEditing && this.currentProduct._id) {
      this.productService.updateProduct(this.currentProduct._id, formData).subscribe({
        next: (updatedProduct) => {
          this.isLoading = false;
          this.loadProducts();
          this.closeModal();
        },
        error: (err) => {
          console.error('Error updating product', err);
          this.isLoading = false;
          alert('Failed to update product');
        }
      });
    } else {
      this.productService.createProduct(formData).subscribe({
        next: (newProduct) => {
          this.isLoading = false;
          this.loadProducts();
          this.closeModal();
        },
        error: (err) => {
          console.error('Error creating product', err);
          this.isLoading = false;
          alert('Failed to create product');
        }
      });
    }
  }

  deleteProduct(id: string) {
    if(confirm('Are you sure you want to delete this product?')) {
      this.productService.deleteProduct(id).subscribe({
        next: () => {
          this.loadProducts();
        },
        error: (err) => {
          console.error('Error deleting product', err);
          alert('Failed to delete product');
        }
      });
    }
  }
}
