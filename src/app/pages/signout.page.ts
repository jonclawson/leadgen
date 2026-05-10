import { Component, OnInit } from "@angular/core";
import { authClient } from "../../lib/auth-client";

@Component({
  selector: 'signout-page',
  template: `
  `,
  imports: [
  ]
})
export default class SignoutPage implements OnInit {

  ngOnInit() {
    this.signOut();
  }

  async signOut() {
    const { error } = await authClient.signOut();
    if (error) {
      console.error(error.message);
      return;
    }
    // Handle successful sign out
    console.log("Signed out successfully");
    window.location.href = '/';
  }
}