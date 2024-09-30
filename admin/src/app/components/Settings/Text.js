import React from "react";
// Bootstrap
import { Editor } from "@tinymce/tinymce-react";
const Text = ({ value, setvalue }) => {
    return (
        <Editor
            apiKey="2twaih02wh568kgkbrd677m4od3t6dztzsrv0cuowm830r8h"
            value={value}
            init={{
                height: 400,
                menubar: true,
                plugins: [
                    "advlist autolink lists link image charmap print preview anchor",
                    "searchreplace visualblocks code fullscreen",
                    "insertdatetime media table paste code help wordcount",
                ],
                toolbar:
                    "link undo redo | formatselect | " +
                    "bold italic backcolor | alignleft aligncenter " +
                    "alignright alignjustify | bullist numlist outdent indent | " +
                    "removeformat | help",
                content_style:
                    "body { font-family:Helvetica,Arial,sans-serif; font-size:14px }",
                file_picker_types: "image",
                images_file_types: "jpg,jpeg,png,webp",
                /* and here's our custom image picker*/
                file_picker_callback: function (cb, value, meta) {
                    var input = document.createElement("input");
                    input.setAttribute("type", "file");
                    input.setAttribute("accept", "image/*");
                    input.onchange = function () {
                        var file = this.files[0];
                        var reader = new FileReader();
                        reader.onload = function () {
                            var id = "blobid" + new Date().getTime();
                            var blobCache =
                                window.tinymce.activeEditor.editorUpload.blobCache;
                            var base64 = reader.result.split(",")[1];
                            var blobInfo = blobCache.create(id, file, base64);
                            blobCache.add(blobInfo);
                            cb(blobInfo.blobUri(), { title: file.name });
                        };
                        reader.readAsDataURL(file);
                    };
                    input.click();
                },
            }}
            onEditorChange={(newValue, editor) => {
                setvalue(newValue);
            }}
        />
    );
};
export default Text;