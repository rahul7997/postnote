import { Component, OnInit } from '@angular/core';
import { AngularFireDatabase } from '@angular/fire/database';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from 'src/app/services/auth.service';
import { imageConfig } from 'src/utils/config';
import { v4 as uuidv4 } from 'uuid';
import { readAndCompressImage } from 'browser-image-resizer';
import { AngularFireStorage } from '@angular/fire/storage';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-addpost',
  templateUrl: './addpost.component.html',
  styleUrls: ['./addpost.component.css']
})
export class AddpostComponent implements OnInit {
  postTitle: string = "";
  picture: string;
  caption: string;
  user = null;
  uploadPercent: number;

  constructor(private router: Router,
              private toastr: ToastrService,
              private authService: AuthService,
              private db: AngularFireDatabase,
              private storage: AngularFireStorage) { 
                this.authService.getUser().subscribe((res) => {
                  this.db.object(`users/${res.uid}`)
                    .valueChanges().subscribe((user) => {
                      this.user = user;
                    });
                });
              }

  ngOnInit(): void {
  }

  submitPost(){
    const uid = uuidv4();

    this.db.object(`posts/${uid}`).set({
        id: uid,
        postTitle: this.postTitle,
        caption: this.caption,
        picture: this.picture,
        by: this.user.username,
        date: Date.now()
    }).then(() => {
      this.toastr.success("Post added");
      this.router.navigateByUrl("/");
    }).catch((err) => {
      this.toastr.error("Some error occured");
    })
  }

  async uploadPostPicture(event){
    const file = event.target.files[0];
    const resizedImage = await readAndCompressImage(file, imageConfig);
    let filepath = file.name+uuidv4();
    let fileref = this.storage.ref(filepath);
    const task = this.storage.upload(filepath, resizedImage);

    task.percentageChanges().subscribe((res) => {
      this.uploadPercent = res;
    });

    task.snapshotChanges().pipe(finalize(() => {
      fileref.getDownloadURL().subscribe((res) => {
        this.picture = res;
      })
    })).subscribe();
  }

}
