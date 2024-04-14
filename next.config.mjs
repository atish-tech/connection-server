/** @type {import('next').NextConfig} */
const nextConfig = {
    webpack: (config) => {
        config.externals.push({
          "utf-8-validate": "commonjs utf-8-validate",
          bufferutil: "commonjs bufferutil"
        });
    
        return config;
      },
    typescript: {
        // !! WARN !!
        // Dangerously allow production builds to successfully complete even if
        // your project has type errors.
        // !! WARN !!
        ignoreBuildErrors: true,
      },
      eslint :{
        ignoreDuringBuilds: true,
      }
};
 
export default nextConfig;
