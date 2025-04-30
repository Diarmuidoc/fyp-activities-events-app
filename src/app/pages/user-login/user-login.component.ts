import {Component, inject, OnInit} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {MatFormField} from '@angular/material/form-field';
import {MatButton} from '@angular/material/button';
import {MatInput} from '@angular/material/input';
import {Router, RouterLink} from '@angular/router';
import {HttpClient} from '@angular/common/http';
import {AuthenticationService} from '../../services/authentication.service';

@Component({
  selector: 'app-user-login',
  imports: [
    ReactiveFormsModule,
    MatFormField,
    MatInput,
    MatButton,
    RouterLink,
  ],
  templateUrl: './user-login.component.html',
  styleUrl: './user-login.component.css'
})
export class UserLoginComponent {

  fb = inject(FormBuilder);
  http = inject(HttpClient);
  router = inject(Router);
  authService = inject(AuthenticationService);

  form = this.fb.nonNullable.group({
    email: ['', Validators.required],
    password: ['', Validators.required],
  });

  errorMessage: string | null = null;

  onSubmit(): void {
    const rawForm = this.form.getRawValue()
    this.authService.login(rawForm.email, rawForm.password)
      .subscribe({
        next: () => {
          this.router.navigateByUrl('/');
        },
        error: (err) => {
          this.errorMessage = err.message;
        }
      })
  }
}
