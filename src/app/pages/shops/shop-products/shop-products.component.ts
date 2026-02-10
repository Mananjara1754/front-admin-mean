import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ProductService, Product } from '../../../services/product.service';
import { ShopService } from '../../../services/shop.service';
import { CategoryService, Category } from '../../../services/category.service';

@Component({
  selector: 'app-shop-products',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './shop-products.component.html',
  styleUrl: './shop-products.component.css'
})
export class ShopProductsComponent implements OnInit {
  shopId: string | null = null;
  shopName: string = '';
  products: Product[] = [];
  categories: Category[] = [];
  showForm = false;
  isLoading = false;
  isEditing = false;
  selectedFiles: File[] = [];

  currentProduct: any = this.getEmptyProduct();

  constructor(
    private route: ActivatedRoute,
    private productService: ProductService,
    private shopService: ShopService,
    private categoryService: CategoryService
  ) { }

  ngOnInit() {
    this.shopId = this.route.snapshot.paramMap.get('id');
    if (this.shopId) {
      this.loadShopInfo();
      this.loadProducts();
      this.loadCategories();
    }
  }

  getEmptyProduct() {
    return {
      name: '',
      description: '',
      category_id: '',
      shop: this.shopId || '',
      price: { current: 0, currency: 'MGA' },
      stock: { quantity: 0, status: 'IN_STOCK' },
      images: []
    };
  }

  loadShopInfo() {
    if (!this.shopId) return;
    this.shopService.getShopById(this.shopId).subscribe(shop => {
      this.shopName = shop.name;
    });
  }

  loadProducts() {
    if (!this.shopId) return;
    this.productService.getProducts({ shop_id: this.shopId }).subscribe(products => {
      this.products = products;
    });
  }

  loadCategories() {
    this.categoryService.getCategories().subscribe(categories => {
      this.categories = categories;
    });
  }

  getCategoryName(categoryId: string | undefined): string {
    if (!categoryId) return 'N/A';
    const category = this.categories.find(c => c._id === categoryId);
    return category ? category.name : 'Unknown';
  }

  toggleForm() {
    this.showForm = !this.showForm;
    if (this.showForm) {
      this.isEditing = false;
      this.currentProduct = this.getEmptyProduct();
      this.selectedFiles = [];
    }
  }

  editProduct(product: Product) {
    this.isEditing = true;
    this.currentProduct = JSON.parse(JSON.stringify(product));
    this.selectedFiles = [];
    this.showForm = true;
  }

  onFileSelected(event: any) {
    if (event.target.files) {
      this.selectedFiles = Array.from(event.target.files);
    }
  }

  onSubmit() {
    if (!this.shopId) return;

    this.isLoading = true;
    const formData = new FormData();
    formData.append('shop', this.shopId);
    formData.append('name', this.currentProduct.name);
    formData.append('description', this.currentProduct.description || '');
    formData.append('category_id', this.currentProduct.category_id || '');
    
    formData.append('price[current]', this.currentProduct.price.current.toString());
    formData.append('price[currency]', this.currentProduct.price.currency || 'MGA');
    formData.append('stock[quantity]', this.currentProduct.stock.quantity.toString());
    formData.append('stock[status]', this.currentProduct.stock.status || 'IN_STOCK');

    this.selectedFiles.forEach((file) => {
      formData.append('images', file);
    });

    if (this.isEditing && this.currentProduct._id) {
      this.productService.updateProduct(this.currentProduct._id, formData).subscribe({
        next: () => {
          this.loadProducts();
          this.isLoading = false;
          this.showForm = false;
          this.currentProduct = this.getEmptyProduct();
        },
        error: (err) => {
          console.error('Failed to update product', err);
          this.isLoading = false;
        }
      });
    } else {
      this.productService.createProduct(formData).subscribe({
        next: (product) => {
          this.products.push(product);
          this.isLoading = false;
          this.showForm = false;
          this.currentProduct = this.getEmptyProduct();
        },
        error: (err) => {
          console.error('Failed to create product', err);
          this.isLoading = false;
        }
      });
    }
  }
}
