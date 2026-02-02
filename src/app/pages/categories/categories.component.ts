import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CategoryService, CategoryProduct } from '../../services/category.service';

@Component({
  selector: 'app-categories',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './categories.component.html',
  styleUrl: './categories.component.css'
})
export class CategoriesComponent implements OnInit {
  categories: CategoryProduct[] = [];
  isLoading = false;
  showModal = false;
  isEditing = false;
  currentCategory: CategoryProduct = {
    name: '',
    description: '',
    slug: ''
  };

  constructor(private categoryService: CategoryService) { }

  ngOnInit(): void {
    this.loadCategories();
  }

  loadCategories() {
    this.isLoading = true;
    this.categoryService.getCategories().subscribe({
      next: (data) => {
        this.categories = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading categories', err);
        this.isLoading = false;
      }
    });
  }

  openAddModal() {
    this.isEditing = false;
    this.currentCategory = { name: '', description: '', slug: '' };
    this.showModal = true;
  }

  openEditModal(category: CategoryProduct) {
    this.isEditing = true;
    this.currentCategory = { ...category };
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
  }

  saveCategory() {
    if (!this.currentCategory.name) return;

    if (this.isEditing && this.currentCategory._id) {
      this.categoryService.updateCategory(this.currentCategory._id, this.currentCategory).subscribe({
        next: () => {
          this.loadCategories();
          this.closeModal();
        },
        error: (err) => console.error('Error updating category', err)
      });
    } else {
      this.categoryService.createCategory(this.currentCategory).subscribe({
        next: () => {
          this.loadCategories();
          this.closeModal();
        },
        error: (err) => console.error('Error creating category', err)
      });
    }
  }

  deleteCategory(id: string) {
    if (confirm('Are you sure you want to delete this category?')) {
      this.categoryService.deleteCategory(id).subscribe({
        next: () => this.loadCategories(),
        error: (err) => console.error('Error deleting category', err)
      });
    }
  }
}
