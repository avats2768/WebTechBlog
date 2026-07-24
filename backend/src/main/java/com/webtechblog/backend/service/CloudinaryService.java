package com.webtechblog.backend.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.webtechblog.backend.constants.CloudinaryConstants;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class CloudinaryService {

    private final Cloudinary cloudinary;

    public String uploadImage(
            MultipartFile file,
            String folder
    ) {

        try {

            Map<?, ?> result =
                    cloudinary.uploader().upload(
                            file.getBytes(),
                            ObjectUtils.asMap(
                                    "folder",
                                    folder
                            )
                    );

            return result.get("secure_url").toString();

        } catch (IOException e) {

            throw new RuntimeException(
                    "Image upload failed.",
                    e
            );

        }

    }

    public void deleteImage(String imageUrl) {

        if (imageUrl == null || imageUrl.isBlank()) {
            return;
        }

        if (imageUrl.equals(CloudinaryConstants.DEFAULT_PROFILE_IMAGE)
                || imageUrl.equals(CloudinaryConstants.DEFAULT_COVER_IMAGE)) {
            return;
        }

        // Not a Cloudinary image
        if (!imageUrl.contains("res.cloudinary.com")) {
            return;
        }

        try {

            String publicId = extractPublicId(imageUrl);

            if (publicId == null) {
                return;
            }

            Map result = cloudinary.uploader().destroy(
                    publicId,
                    ObjectUtils.emptyMap()
            );

            System.out.println(result);

        } catch (Exception e) {

            e.printStackTrace();

        }

    }

    private String extractPublicId(String imageUrl) {

        if (!imageUrl.contains("/upload/")) {
            return null;
        }

        String[] split = imageUrl.split("/upload/");

        if (split.length < 2) {
            return null;
        }

        String path = split[1];

        path = path.replaceFirst(
                "v\\d+/",
                ""
        );

        return path.substring(
                0,
                path.lastIndexOf(".")
        );

    }

}