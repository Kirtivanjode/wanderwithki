// adventure.component.ts
import { Component, OnInit } from '@angular/core';
import { BlogService } from '../../services/blog.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

export interface Adventure {
  Name: string;
  Id: number;
  Description: string;
  Location: string;
  ImageId: number;
}

@Component({
  selector: 'app-adventure',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './adventure.component.html',
  styleUrls: ['./adventure.component.css'],
})
export class AdventureComponent implements OnInit {
  isAdmin = false;
  adventures: Adventure[] = [];
  editingId: number | null = null;
  addingNew = false;

  form: {
    description: string;
    location: string;
    imageFile: File | null;
    Name: string;
  } = {
    description: '',
    location: '',
    imageFile: null,
    Name: '',
  };

  constructor(private blogService: BlogService, private router: Router) {}

  ngOnInit() {
    const user = JSON.parse(sessionStorage.getItem('user') || '{}');
    const currentUrl = this.router.url;

    this.isAdmin = user?.role === 'admin' && currentUrl.startsWith('/admin');

    console.log('Admin check:', this.isAdmin, 'URL:', currentUrl);
    this.fetchAdventures();
  }

  fetchAdventures() {
    this.blogService.getAdventures().subscribe((data: Adventure[]) => {
      this.adventures = data;
      this.resetForm();
    });
  }

  editAdventure(adventure: Adventure) {
    this.editingId = adventure.Id;
    this.addingNew = false;
    this.form.description = adventure.Description;
    this.form.location = adventure.Location;
    // Removed imagePreview
    this.form.imageFile = null;
    this.form.Name = adventure.Name || '';
  }

  deleteAdventure(id: number) {
    if (!this.isAdmin) return;
    this.blogService.deleteAdventure(id).subscribe(() => {
      this.fetchAdventures();
    });
  }

  onImageSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.form.imageFile = input.files[0];
      // Removed FileReader and imagePreview logic
    }
  }

  submitForm() {
    if (!this.isAdmin) return;

    const formData = new FormData();
    formData.append('name', this.form.Name);
    formData.append('description', this.form.description);
    formData.append('location', this.form.location);

    if (this.form.imageFile) {
      formData.append('image', this.form.imageFile);
    }

    if (this.editingId) {
      this.blogService
        .updateAdventure(this.editingId, formData)
        .subscribe(() => {
          this.fetchAdventures();
          this.resetForm();
        });
    } else if (this.addingNew) {
      this.blogService.addAdventure(formData).subscribe(() => {
        this.fetchAdventures();
        this.resetForm();
      });
    }
  }

  startAddAdventure() {
    this.addingNew = true;
    this.editingId = null;
    this.form = {
      description: '',
      location: '',
      imageFile: null,
      Name: '',
    };
    // Removed reset of imagePreview
  }

  resetForm() {
    this.editingId = null;
    this.addingNew = false;
    this.form = {
      description: '',
      location: '',
      imageFile: null,
      Name: '',
    };
  }

  getImageUrl(imageId: number | null): string {
    return imageId ? `http://localhost:3000/api/images/${imageId}` : '';
  }

  trackById(index: number, item: Adventure): number {
    return item.Id;
  }
}
