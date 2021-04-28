package com.example2;

import android.os.Bundle;
import android.os.SystemClock;

import com.facebook.react.ReactActivity;
import com.facebook.react.bridge.ReactMarker;
import com.facebook.react.bridge.ReactMarkerConstants;
import com.facebook.react.modules.core.DeviceEventManagerModule;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.bridge.Arguments;

import java.util.Map;
import java.util.HashMap;

class PerformanceMark {
  public String type;
  public String name;
  public String tag;
  public long timestamp;

  public PerformanceMark(String type, String name, String tag, long timestamp) {
    this.type = type;
    this.name = name;
    this.tag = tag;
    this.timestamp = timestamp;
  }
}

public class MainActivity extends ReactActivity {

  /**
   * Returns the name of the main component registered from JavaScript. This is used to schedule
   * rendering of the component.
   */
  @Override
  protected String getMainComponentName() {
    return "example2";
  }

  // 首帧渲染以后不再记录到缓存，而是直接发送事件
  private boolean eventsBuffered = true;
  // 事件缓存
  private static Map<String, PerformanceMark> markBuffer = new HashMap();

  @Override
  protected void onCreate(Bundle savedInstanceState) {
    super.onCreate(savedInstanceState);

    setupMarkerListener();
    setupListener();
  }

  private void setupMarkerListener() {
    ReactMarker.addListener(
      (name, tag, instanceKey) -> {
        switch (name) {
          case CONTENT_APPEARED:
            eventsBuffered = false;
            emitBufferedMarks();
            break;
          case DOWNLOAD_START:
            eventsBuffered = true;
            break;
        }
      }
    );
  }

  public void setupListener() {
    ReactMarker.addListener(
      (name, tag, instanceKey) -> {
        long startTime = SystemClock.uptimeMillis();
        System.out.println("name: " + name);
        switch (name) {
          case DOWNLOAD_START:
            markBuffer.clear();
            // 标记开始时间
            safelyEmitMark(
              "react-native-mark",
              "initTIme",
              "",
              SystemClock.uptimeMillis()
            );
          case RELOAD:
          case ATTACH_MEASURED_ROOT_VIEWS_END:
          case ATTACH_MEASURED_ROOT_VIEWS_START:
          case BUILD_NATIVE_MODULE_REGISTRY_END:
          case BUILD_NATIVE_MODULE_REGISTRY_START:
          case CONTENT_APPEARED:
          case CREATE_CATALYST_INSTANCE_END:
          case CREATE_CATALYST_INSTANCE_START:
          case CREATE_REACT_CONTEXT_END:
          case CREATE_REACT_CONTEXT_START:
          case CREATE_UI_MANAGER_MODULE_CONSTANTS_END:
          case CREATE_UI_MANAGER_MODULE_CONSTANTS_START:
          case CREATE_UI_MANAGER_MODULE_END:
          case CREATE_UI_MANAGER_MODULE_START:
          case CREATE_VIEW_MANAGERS_END:
          case CREATE_VIEW_MANAGERS_START:
          case DOWNLOAD_END:
          case LOAD_REACT_NATIVE_SO_FILE_END:
          case LOAD_REACT_NATIVE_SO_FILE_START:
          case PRE_RUN_JS_BUNDLE_START:
          case PRE_SETUP_REACT_CONTEXT_END:
          case PRE_SETUP_REACT_CONTEXT_START:
          case PROCESS_CORE_REACT_PACKAGE_END:
          case PROCESS_CORE_REACT_PACKAGE_START:
          case REACT_CONTEXT_THREAD_END:
          case REACT_CONTEXT_THREAD_START:
          case RUN_JS_BUNDLE_END:
          case RUN_JS_BUNDLE_START:
          case SETUP_REACT_CONTEXT_END:
          case SETUP_REACT_CONTEXT_START:
          case PROCESS_PACKAGES_START:
          case PROCESS_PACKAGES_END:
          case VM_INIT:
            safelyEmitMark(
              "react-native-mark",
              instanceKey + "-" + getMarkName(name),
              tag,
              startTime
            );
            break;
          case NATIVE_MODULE_SETUP_START:
          case NATIVE_MODULE_SETUP_END:
          case REGISTER_JS_SEGMENT_START:
          case REGISTER_JS_SEGMENT_STOP:
            safelyEmitMark(
              "react-native-mark",
              tag + "-" + getMarkName(name),
              tag,
              startTime
            );
            break;
        }
      }
    );
  }

  private static String getMarkName(ReactMarkerConstants name) {
    StringBuffer sb = new StringBuffer();
    for (String s : name.toString().toLowerCase().split("_")) {
      if (sb.length() == 0) {
        sb.append(s);
      } else {
        sb.append(Character.toUpperCase(s.charAt(0)));
        if (s.length() > 1) {
          sb.append(s.substring(1, s.length()));
        }
      }
    }
    return sb.toString();
  }

  private void safelyEmitMark(String type,
                              String name,
                              String tag,
                              long startTime) {
    if (eventsBuffered) {
      markBuffer.put(name, new PerformanceMark(type, name, tag, startTime));
    } else {
      emit(type, name, tag, startTime);
    }
  }

  // 清除并发送缓存中的事件
  private void emitBufferedMarks() {
    for (Map.Entry<String, PerformanceMark> entry : markBuffer.entrySet()) {
      PerformanceMark mark = entry.getValue();
      emit(mark.type, mark.name, mark.tag, mark.timestamp);
    }
  }

  private void emit(String type,
                    String name,
                    String tag,
                    long startTime) {
    System.out.println("emit: " + name + " " + startTime);
    WritableMap params = Arguments.createMap();
    params.putString("type", type);
    params.putString("name", name);
    params.putString("tag", tag);
    params.putInt("timestamp", (int) startTime);
    this.getReactInstanceManager().getCurrentReactContext()
      .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
      .emit(type, params);
  }
}
