// web/client/app/page.js
"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import * as fcl from "@onflow/fcl";
import { redirect } from 'next/navigation';

// Configure FCL for Flow blockchain interaction
fcl.config()
  .put("accessNode.api", "https://rest-testnet.onflow.org")
  .put("discovery.wallet", "https://fcl-discovery.onflow.org/testnet/authn")
  .put("app.detail.title", "Code Marketplace")
  .put("app.detail.icon", "https://placekitten.com/g/200/200")
  .put("0x9d2ade18cb6bea1a", "0x9d2ade18cb6bea1a");

export default function Home() {
  redirect('/listings');
}