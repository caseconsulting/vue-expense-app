<template>
  <div id="app">
    <ckeditor :editor="editor" v-model="editorData" :config="editorConfig"></ckeditor>
  </div>
</template>
<script>
// import CKEditor from '@ckeditor/ckeditor5-vue';
// import ClassicEditor from '@ckeditor/ckeditor5-build-classic';

// export default {
//   components: {
//     // Use the <ckeditor> component in this view.
//     ckeditor: CKEditor.component
//   },
//   data() {
//     return {
//       editor: ClassicEditor,
//       editorConfig: {
//         height: '500px'
//       }
//       // ...
//     };
//   }
// };

import CKEditor from '@ckeditor/ckeditor5-vue';
import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor';

import Base64UploadAdapter from '@ckeditor/ckeditor5-upload/src/adapters/base64uploadadapter';
import EssentialsPlugin from '@ckeditor/ckeditor5-essentials/src/essentials';
import BoldPlugin from '@ckeditor/ckeditor5-basic-styles/src/bold';
import ItalicPlugin from '@ckeditor/ckeditor5-basic-styles/src/italic';
import LinkPlugin from '@ckeditor/ckeditor5-link/src/link';
import ParagraphPlugin from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import Image from '@ckeditor/ckeditor5-image/src/image';
import ImageResize from '@ckeditor/ckeditor5-image/src/imageresize';
import ImageToolbar from '@ckeditor/ckeditor5-image/src/imagetoolbar';
import ImageStyle from '@ckeditor/ckeditor5-image/src/imagestyle';
import ImageCaption from '@ckeditor/ckeditor5-image/src/imagecaption';
//import Heading from '@ckeditor/ckeditor5-heading/src/heading';

export default {
  name: 'app',
  components: {
    // Use the <ckeditor> component in this view.
    ckeditor: CKEditor.component
  },
  data() {
    return {
      editor: ClassicEditor,
      editorData: '',
      editorConfig: {
        plugins: [
          Image,
          ImageCaption,
          ImageResize,
          ImageStyle,
          ImageToolbar,
          EssentialsPlugin,
          BoldPlugin,
          ItalicPlugin,
          LinkPlugin,
          ParagraphPlugin,
          Base64UploadAdapter
          //heading
        ],
        toolbar: ['heading', 'bold', 'italic', '|', 'undo', 'redo'],
        heading: {
          options: [
            { model: 'paragraph', title: 'Paragraph', class: 'ck-heading_paragraph' },
            { model: 'heading1', view: 'h1', title: 'Heading 1', class: 'ck-heading_heading1' },
            { model: 'heading2', view: 'h2', title: 'Heading 2', class: 'ck-heading_heading2' }
          ]
        },
        image: {
          styles: ['alignLeft', 'alignCenter', 'alignRight'],
          resizeOptions: [
            {
              name: 'imageResize:original',
              label: 'Original',
              value: null
            },
            {
              name: 'imageResize:50',
              label: '50%',
              value: '50'
            },
            {
              name: 'imageResize:75',
              label: '75%',
              value: '75'
            }
          ],
          toolbar: [
            'imageStyle:alignLeft',
            'imageStyle:alignCenter',
            'imageStyle:alignRight',
            '|',
            'imageResize',
            '|',
            'imageTextAlternative'
          ]
        },
        placeholder: 'Create a New Blog Post'
      }
    };
  }
};
</script>

<style>
/* .ck-editor__editable {
  min-height: 500px;
} */
</style>
