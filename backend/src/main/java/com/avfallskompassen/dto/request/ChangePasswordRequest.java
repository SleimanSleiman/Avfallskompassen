package com.avfallskompassen.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * Request payload for changing a user's password.
 */
public class ChangePasswordRequest {

    @NotBlank(message = "Nuvarande lösenord krävs")
    @Size(min = 6, max = 255, message = "Lösenordet måste vara minst 6 tecken")
    private String oldPassword;

    @NotBlank(message = "Nytt lösenord krävs")
    @Size(min = 6, max = 255, message = "Lösenordet måste vara minst 6 tecken")
    private String newPassword;

    public ChangePasswordRequest() {
    }

    public ChangePasswordRequest(String oldPassword, String newPassword) {
        this.oldPassword = oldPassword;
        this.newPassword = newPassword;
    }

    public String getOldPassword() {
        return oldPassword;
    }

    public void setOldPassword(String oldPassword) {
        this.oldPassword = oldPassword;
    }

    public String getNewPassword() {
        return newPassword;
    }

    public void setNewPassword(String newPassword) {
        this.newPassword = newPassword;
    }
}
