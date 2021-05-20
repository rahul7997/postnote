import { Component, OnInit } from '@angular/core';
import { AngularFireDatabase } from '@angular/fire/database';
import { AngularFireStorage } from '@angular/fire/storage';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { finalize } from 'rxjs/operators';
import { AuthService } from 'src/app/services/auth.service';
import { imageConfig } from 'src/utils/config';
import { v4 as uuidv4 } from 'uuid';
import { readAndCompressImage } from 'browser-image-resizer'; 

@Component({
  selector: 'app-post-edit',
  templateUrl: './post-edit.component.html',
  styleUrls: ['./post-edit.component.css']
})
export class PostEditComponent implements OnInit {

  uploadPercent: number;
  user: any;
  postId: any;
  post = { 
    postTitle: '',
    caption: '',
    picture: ''
  }

  constructor(private router: Router,
              private toastr: ToastrService,
              private authService: AuthService,
              private db: AngularFireDatabase,
              private storage: AngularFireStorage,
              private activatedRoute: ActivatedRoute) { 
                this.authService.getUser().subscribe((res) => {
                  this.db.object(`users/${res.uid}`)
                    .valueChanges().subscribe((user) => {
                      this.user = user;
                    });
                });
  }

  ngOnInit(): void {
    this.activatedRoute.queryParams.subscribe((queryParams) => {
      this.postId = queryParams.postId;
      this.db.object(`/posts/${this.postId}`).valueChanges().subscribe((res: any) => {
        this.post = res;
      });
    });
  }

  savePost(){
    this.db.object(`posts/${this.postId}`).update({
        postTitle: this.post.postTitle,
        caption: this.post.caption,
        picture: this.post.picture,
        by: this.user.username,
        date: Date.now()
    }).then(() => {
      this.toastr.success("Post updated");
      this.router.navigateByUrl("/");
    }).catch((err) => {
      this.toastr.error("Some error occured");
    });
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
        this.post.picture = res;
      })
    })).subscribe();
  }
}
