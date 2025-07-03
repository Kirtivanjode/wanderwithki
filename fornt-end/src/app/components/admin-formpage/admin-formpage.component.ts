import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { BlogService } from '../../services/blog.service';
import { ToastrService } from 'ngx-toastr';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-admin-formpage',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-formpage.component.html',
  styleUrls: ['./admin-formpage.component.css'],
})
export class AdminFormpageComponent {
  loginData = { username: '', password: '' };
  returnUrl = '/admin/blog';

  constructor(
    public router: Router,
    private authService: AuthService,
    private blogService: BlogService,
    private toastr: ToastrService
  ) {
    if (this.authService.isLoggedIn() && this.authService.isAdmin()) {
      this.router.navigate(['/admin/home']);
    }
  }

  login() {
    this.blogService.adminlogin(this.loginData).subscribe({
      next: (res) => {
        const userWithRole = { ...res.user, role: res.user.role || 'admin' };

        this.authService.setUser({ ...userWithRole, token: res.token });
        this.router.navigateByUrl(this.returnUrl);
      },
      error: (err) => {
        this.toastr.error(err.error?.message || 'Admin login failed');
      },
    });
  }
}
