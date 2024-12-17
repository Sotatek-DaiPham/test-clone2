import { useEffect, useState } from "react";

export default function withClient<P extends {}>(
  Component: React.ComponentType<P>
) {
  const WithClient = (props: P) => {
    const [isClient, setIsClient] = useState(false);
    useEffect(() => {
      setIsClient(true);
    }, []);
    return isClient ? <Component {...props} /> : null;
  };
  return WithClient;
}
