import { Component, Input, OnInit, OnChanges } from '@angular/core';
import { AngularFireDatabase } from '@angular/fire/database';
import { ActivatedRoute, Router } from '@angular/router';
import { faEdit, faThumbsDown, faThumbsUp, faTrashAlt } from '@fortawesome/free-solid-svg-icons';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-post',
  templateUrl: './post.component.html',
  styleUrls: ['./post.component.css']
})
export class PostComponent implements OnInit, OnChanges {
  @Input() post;
  upvote = 0;
  downvote = 0;
  uid = null;
  user: any;
  
  faThumbsUp = faThumbsUp;
  faThumbsDown = faThumbsDown;
  faTrashAlt = faTrashAlt;
  faEdit = faEdit;

  constructor(private db: AngularFireDatabase,
              private authService: AuthService,
              private toastr: ToastrService,
              private router: Router,
              private activatedRoute: ActivatedRoute) { }

  ngOnInit(): void {
    this.authService.getUser().subscribe((res) => {
      if(res){
        this.uid = res.uid;
        this.db.object(`/users/${this.uid}`).valueChanges().subscribe((dbuser) => {
          this.user = dbuser;
        });
      }
    });
  }

  ngOnChanges(){
    this.updateVoteCounts();
  }

  upvotePost(){
    this.db.object(`posts/${this.post.id}/votes/${this.uid}`).set({
      upvote: 1
    });
  }

  downvotePost(){
    this.db.object(`posts/${this.post.id}/votes/${this.uid}`).set({
      downvote: 1
    });
  }

  updateVoteCounts(){
    if(this.post.votes){
      Object.values(this.post.votes).map((val: any) => {
        if(val.upvote){
          this.upvote += 1;
        }
        if(val.downvote){
          this.downvote += 1;
        }
      });
    }
  }

  deletePost(){
    if(this.post.by == this.user.username){
      const choice = confirm('Are you sure you want to delete this post');
      if(choice){
        this.db.object(`/posts/${this.post.id}`).remove().then(() => {
          this.toastr.success('Post deleted');
        }).catch((err) => {
          this.toastr.error('Post not found');
        });
      } 
    } else {
      this.toastr.info('You can only delete posts uploaded by you.');
    }
  }

  editPost(){
    if(this.post.by == this.user.username){
      this.router.navigate(['post-edit'], {queryParams: {postId: this.post.id}});
    } else {
      this.toastr.info('You can edit only posts uploaded by you');
    }
  }

}
