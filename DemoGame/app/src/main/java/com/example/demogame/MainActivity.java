package com.example.demogame;

import androidx.appcompat.app.AppCompatActivity;

import android.os.Bundle;

import koisignal.hexahop.per.R;

public class MainActivity extends AppCompatActivity {

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);
        System.loadLibrary("main");
    }
}