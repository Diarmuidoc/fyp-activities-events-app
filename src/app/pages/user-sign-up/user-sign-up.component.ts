import {Component, inject} from '@angular/core';
import {FormBuilder, ReactiveFormsModule, Validators} from '@angular/forms';
import {AuthenticationService} from '../../services/authentication.service';
import {HttpClient} from '@angular/common/http';
import {Router} from '@angular/router';
import {MatFormField} from '@angular/material/form-field';
import {MatButton} from '@angular/material/button';
import {MatInput} from '@angular/material/input';

@Component({
  selector: 'app-user-sign-up',
  imports: [
    ReactiveFormsModule,
    MatFormField,
    MatButton,
    MatInput
  ],
  templateUrl: './user-sign-up.component.html',
  styleUrl: './user-sign-up.component.css'
})
export class UserSignUpComponent {
  fb = inject(FormBuilder);
  http = inject(HttpClient);
  authService = inject(AuthenticationService);
  router = inject(Router);

  form = this.fb.nonNullable.group({
    email: ['', Validators.required],
    username: ['', Validators.required],
    password: ['', Validators.required],

  })

  errorMessage: string | null = null;

  onSubmit(): void {
    const rawForm = this.form.getRawValue()
    this.authService.register(rawForm.email, rawForm.username, rawForm.password)
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
