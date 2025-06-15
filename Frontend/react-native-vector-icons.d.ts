declare module 'react-native-vector-icons/MaterialIcons' {
  import { Component } from 'react';
  import { ImageSourcePropType } from 'react-native';
  
  interface IconProps {
    name: string;
    size?: number;
    color?: string;
    style?: any;
  }
  
  class Icon extends Component<IconProps> {
    static getImageSource(
      name: string,
      size?: number,
      color?: string,
    ): Promise<ImageSourcePropType>;
  }
  
  export default Icon;
}

declare module 'react-native-vector-icons/Feather' {
  import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
  export default MaterialIcons;
}

declare module 'react-native-vector-icons/FontAwesome' {
  import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
  export default MaterialIcons;
}
