import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from 'src/app/services/auth.service';

import { finalize } from 'rxjs/operators';
import { AngularFireDatabase } from '@angular/fire/database';
import { AngularFireStorage } from '@angular/fire/storage';
import { readAndCompressImage } from 'browser-image-resizer';
import { imageConfig } from 'src/utils/config';
import { v4 as uuidv4 } from 'uuid';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignupComponent implements OnInit {
  error: any;
  picture: string = "./assets/user_image1.png";
  uploadPercent: any;

  constructor(private authService: AuthService, 
              private router: Router,
              private toastr: ToastrService,
              private db: AngularFireDatabase,
              private storage: AngularFireStorage) { }

  ngOnInit(): void {
  }

  onSignUp(f: NgForm){
    const {email, password, username, country, bio } = f.form.value;
    this.authService.signUp(email, password).then((res) => {
      const { uid } = res.user;
      this.db.object(`users/${uid}`)
        .set({
          id: uid,
          username: username,
          email: email,
          country: country,
          bio: bio,
          picture: this.picture
        })
    }).then(() => {
      this.toastr.success('Sign up success');
      this.router.navigateByUrl('/');
    }).catch((err) => {
      this.toastr.error('Sign up failed');
      this.error = err;
    });
  }

  async uploadFile(event){
    const file = event.target.files[0];
    let resizedImage = await readAndCompressImage(file, imageConfig);
    let filepath = uuidv4();
    const fileref = this.storage.ref(filepath);
    const task = this.storage.upload(filepath, resizedImage);

    task.percentageChanges().subscribe((res) => {
      this.uploadPercent = res;
    });

    task.snapshotChanges()
      .pipe(finalize(() => {
        fileref.getDownloadURL().subscribe((res) => {
          this.picture = res;
        })
      })).subscribe();

  }

}
