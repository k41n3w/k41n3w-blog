import Document, { Html, Head, Main, NextScript } from "next/document"

class MyDocument extends Document {
  render() {
    return (
      <Html lang="en">
        <Head />
        <body>
          {/* Add a script to polyfill React.useEffectEvent */}
          <script
            dangerouslySetInnerHTML={{
              __html: `
              if (window.React && !window.React.useEffectEvent) {
                window.React.useEffectEvent = function(callback) {
                  return callback;
                };
              }
            `,
            }}
          />
          <Main />
          <NextScript />
        </body>
      </Html>
    )
  }
}

export default MyDocument
